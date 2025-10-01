import { cacheDirectory, moveAsync } from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import getEthiopianDateWithAmharic from '../EthiopianDate';

// Mapping for payment method display
const paymentMethodMap = {
    'ቴሌብር': 'ቴሌብር (Telebirr)',
    'ትራንስፈር': 'ትራንስፈር (Transfer)',
    'ጥሬ ብር': 'ጥሬ ብር (Cash)',
};

// --- Product Aggregation Helper Function ---
// Calculates the total quantity and total price for each unique product
const getProductSummary = (data) => {
    const summary = {};

    data.forEach(sale => {
        sale.items.forEach(item => {
            // Use product name and measurement as the unique key
            const key = `${item.product_name} (${item.measurement})`;
            const quantity = parseFloat(item.quantity) || 0;
            // Use the pre-calculated item_total from your transformed sales data
            const itemTotal = parseFloat(item.item_total) || 0; 

            if (!summary[key]) {
                summary[key] = { totalQuantity: 0, totalPrice: 0 };
            }

            summary[key].totalQuantity += quantity;
            summary[key].totalPrice += itemTotal;
        });
    });

    return summary;
};


/**
 * Component to generate a Daily Sales Report PDF from an array of sales 
 * and immediately share it using expo-sharing.
 * * @param {Array<Object>} salesData - The array of sales objects for the entire report.
 * @param {string} fileName - The base name for the PDF file (e.g., 'DailyReport_2024-01-01').
 */
export default function DailyReportShareButton({
    salesData,
    fileName,
    buttonText = 'የቀን ሪፖርት አውጣ',
    buttonStyle,
    textStyle,
}) {
    const [loading, setLoading] = useState(false);

    // Function to generate the HTML content for the entire Daily Report
    const generateHTML = (data) => {
        
        // Calculate the grand total
        const totalSales = data.reduce((total, sale) => {
            return total + parseFloat(sale.total_amount || 0);
        }, 0);

        // --- 1. Generate HTML for ALL Sales ---
        const allSalesHTML = data.map((sale) => {
            
            // Items Table for a single sale
            const itemsHTML = sale.items.map((item) => {
                const quantity = parseFloat(item.quantity) || 0;
                const unitPrice = parseFloat(item.unit_price) || 0;
                const itemTotal = quantity * unitPrice;
                
                return `
                    <tr class="item-row">
                        <td>${item.product_name} (${item.measurement})</td>
                        <td class="num">${quantity}</td>
                        <td class="num">$${unitPrice.toFixed(2)}</td>
                        <td class="num"><strong>$${itemTotal.toFixed(2)}</strong></td>
                    </tr>
                `;
            }).join('');

            // Single Sale Card Structure
            return `
                <div class="sale-card">
                    <div class="sale-header">
                        <h3>የሽያጭ መለያ (Sale ID): ${sale.sale_id}</h3>
                        <p class="sale-time">${getEthiopianDateWithAmharic((sale.created_at)).fullDate}</p>
                    </div>
                    <p><strong>ቀን (Date):</strong> ${getEthiopianDateWithAmharic((sale.created_at)).fullDate}</p>
                    <p><strong>የመክፈያ ዘዴ (Payment):</strong> ${paymentMethodMap[sale.payment_method] || sale.payment_method}</p>

                    <table class="items-table">
                        <thead>
                            <tr class="header-row">
                                <th>ምርት (Product)</th>
                                <th class="num">ብዛት (Qty)</th>
                                <th class="num">ዋጋ (Price)</th>
                                <th class="num">ጠቅላላ (Total)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                    <div class="sale-total">
                        <span>ጠቅላላ ሽያጭ (Sale Total):</span>
                        <span class="final-amount">$${parseFloat(sale.total_amount).toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join(''); // Removed page-break to keep all sales on one page

        // --- 2. Generate Product Summary HTML ---
        const productSummary = getProductSummary(data);
        
        const summaryRowsHTML = Object.keys(productSummary).map(productKey => {
            const item = productSummary[productKey];
            return `
                <tr>
                    <td>${productKey}</td>
                    <td class="qty-total">${item.totalQuantity}</td>
                    <td class="qty-total">$${item.totalPrice.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        // --- 3. Full HTML Document ---
        return `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* Condensed Styles for Single Page Report */
                        body { font-family: sans-serif; padding: 10px; margin: 0; font-size: 10px; }
                        h1 { text-align: center; color: #333; margin-bottom: 5px; font-size: 18px; }
                        h2 { font-size: 14px; color: #00796b; margin-top: 15px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
                        
                        .daily-summary { text-align: center; background-color: #e0f7fa; padding: 8px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #00bcd4; }
                        .daily-total-label { font-size: 14px; font-weight: bold; color: #00796b; }
                        .daily-total-amount { font-size: 18px; font-weight: bold; color: #c0392b; margin-top: 3px; }
                        
                        .sale-card { border: 1px dashed #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; page-break-inside: avoid; }
                        .sale-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 5px; }
                        .sale-header h3 { font-size: 12px; margin: 0; color: #2c3e50; }
                        .sale-time { font-size: 10px; color: #7f8c8d; }
                        
                        .items-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10px; }
                        .items-table th, .items-table td { border: none; border-bottom: 1px solid #eee; padding: 3px 0; text-align: left; }
                        .items-table th { background-color: #f8f8f8; font-weight: bold; color: #333; }
                        .items-table .num { text-align: right; width: 12%; }
                        
                        .sale-total { text-align: right; font-size: 12px; font-weight: 600; padding-top: 5px; border-top: 1px dashed #ccc; margin-top: 5px; }
                        .final-amount { color: #27ae60; margin-left: 5px; font-weight: bold; }

                        /* New Summary Section Styles */
                        .product-summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                        .product-summary-table th, .product-summary-table td { border: 1px solid #ddd; padding: 5px; text-align: left; }
                        .product-summary-table th { background-color: #e6f7ff; color: #007bff; }
                        .product-summary-table td.qty-total { text-align: right; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>የቀን የሽያጭ ሪፖርት (Daily Sales Report)</h1>
                    <p style="text-align: center; color: #7f8c8d;">ሪፖርት ቀን: ${getEthiopianDateWithAmharic((new Date())).fullDate})}</p>

                    <div class="daily-summary">
                        <div class="daily-total-label">ጠቅላላ የዛሬ ገቢ (GRAND TOTAL)</div>
                        <div class="daily-total-amount">$${totalSales.toFixed(2)} ብር</div>
                    </div>

                    <h2>የሽያጭ ዝርዝር (Sale Details)</h2>
                    ${allSalesHTML}
                    
                    <div style="margin-top: 20px;">
                        <h2>የምርት አጠቃላይ ድምር (Product Summary)</h2>
                        <table class="product-summary-table">
                            <thead>
                                <tr>
                                    <th>ምርት (Product)</th>
                                    <th>ጠቅላላ ብዛት (Total Qty)</th>
                                    <th>ጠቅላላ ዋጋ (Total Price)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${summaryRowsHTML}
                            </tbody>
                        </table>
                    </div>
                    
                    <p style="text-align: center; margin-top: 40px; color: #7f8c8d;">ሪፖርቱ በስርዓቱ የተፈጠረ ነው።</p>
                </body>
            </html>
        `;
    };

  const handlePress = async () => {
    if (!salesData || salesData.length === 0 || !fileName) {
        Alert.alert('Error', 'No sales data found for the report.');
        return;
    }

    setLoading(true);
    let originalPdfUri = null;
    let customPdfUri = null;

    try {
        const html = generateHTML(salesData); 

        // 1. Generate the PDF file to a temporary location with a random name
        const result = await Print.printToFileAsync({ html });
        originalPdfUri = result.uri;

        // 2. Define the new file path with the custom name in a reliable directory
        const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
        customPdfUri = `${cacheDirectory}${finalFileName}`;

        // 3. Move/rename the file to the new path with the custom name
        await moveAsync({
            from: originalPdfUri,
            to: customPdfUri
        });

        // 4. Share the renamed file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(customPdfUri, {
                mimeType: 'application/pdf',
                dialogTitle: `Share Daily Sales Report`,
            });
        } else {
            Alert.alert('Success', 'PDF generated, but sharing is not available on this device.');
        }
        
    } catch (error) {
        console.error('PDF Generation/Sharing Error:', error);
        Alert.alert('Error', `Failed to generate or share PDF. ${error.message}`);
    } finally {
        setLoading(false);
    }
};
    return (
        <TouchableOpacity
            style={[styles.button, buttonStyle]}
            onPress={handlePress}
            disabled={loading || salesData.length === 0}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[styles.text, textStyle]}>{buttonText}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4ECDC4', // Changed to match your summary style color
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12, // Changed to match your summary style border radius
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        color: '#fff',
        fontSize: 14, // Changed to match your summary style font size
        fontWeight: 'bold', // Changed to match your summary style font weight
    },
});