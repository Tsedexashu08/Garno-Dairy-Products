import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Mapping for payment method display
const paymentMethodMap = {
  'ቴሌብር': 'ቴሌብር (Telebirr)',
  'ትራንስፈር': 'ትራንስፈር (Transfer)',
  'ጥሬ ብር': 'ጥሬ ብር (Cash)',
};

/**
 * Component to generate and share a PDF receipt from given data.
 * It uses expo-print to generate the PDF from HTML and expo-sharing to share it.
 */
export default function PDFReceiptButton({
  receiptData,
  fileName,
  buttonText = 'Generate Receipt',
  buttonStyle,
  textStyle,
}) {
  const [loading, setLoading] = useState(false);

  // Function to generate the HTML content for the PDF
  const generateHTML = () => {
    const itemsHTML = receiptData.sale_items.map((item) => {
      // Ensure calculation handles potential non-numeric data gracefully (though typically data should be clean)
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const total = quantity * unitPrice;

      // Escape HTML-sensitive characters in the product name if needed, 
      // but typically not an issue for data from a database.
      const productName = item.Products.name || 'N/A';
      const measurement = item.Products.measurement || 'N/A';

      return `
        <tr>
          <td>${productName}${item.Products.has_container ? ' (with container)' : ''}</td>
          <td>${measurement}</td>
          <td>${quantity}</td>
          <td>${unitPrice.toFixed(2)}</td>
          <td>${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    // Ensure total_amount is a number for toFixed
    const totalAmount = parseFloat(receiptData.total_amount) || 0;

    // NOTE: For better Amharic font support in PDF, an embedded font 
    // might be needed, but 'sans-serif' is the default approach.
    return `
      <html>
        <head>
          <meta charset="UTF-8"> <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ccc; padding: 10px 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .summary { 
              margin-top: 30px; 
              font-size: 18px; 
              text-align: right; 
              padding-right: 8px;
            }
          </style>
        </head>
        <body>
          <h1>የሽያጭ ደረሰኝ (Sales Receipt)</h1>
          <p><strong>የሽያጭ መለያ (Sale ID):</strong> ${receiptData.sale_id}</p>
          <p><strong>ቀን (Date):</strong> ${new Date(receiptData.created_at).toLocaleString()}</p>
          <p><strong>የመክፈያ ዘዴ (Payment Method):</strong> ${paymentMethodMap[receiptData.payment_method] || receiptData.payment_method}</p>
          <table>
            <thead>
              <tr>
                <th>የምርት ስም (Product Name)</th>
                <th>መለኪያ (Measurement)</th>
                <th>ብዛት (Quantity)</th>
                <th>የአንድ ዋጋ (Unit Price)</th>
                <th>ጠቅላላ (Total)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          <div class="summary">
            <strong>ጠቅላላ ድምር (Total Amount):</strong> ${totalAmount.toFixed(2)}
          </div>
        </body>
      </html>
    `;
  };

  // Main handler for PDF generation and sharing
  const handlePress = async () => {
    if (!receiptData || !fileName) {
      Alert.alert('Error', 'Missing receipt data or filename.');
      return;
    }

    setLoading(true);
    let pdfUri = null; // Variable to hold the generated PDF URI
    try {
      const html = generateHTML();
      
      // 1. Generate the PDF file to a temporary location
      const result = await Print.printToFileAsync({ 
        html, 
        // Setting a preferred filename (optional, can be helpful)
        name: `${fileName}_${Date.now()}` 
      });
      pdfUri = result.uri;

      // 2. Check if sharing is available and then share the temporary file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${fileName} Receipt`,
        });
      } else {
        // Fallback or just inform the user
        Alert.alert('Success', 'PDF generated, but sharing is not available on this device.');
      }
      
    } catch (error) {
      console.error('PDF Generation/Sharing Error:', error);
      Alert.alert('Error', 'Failed to generate or share PDF.');
    } finally {
      setLoading(false);
      
      // 3. (Optional but recommended) Clean up the temporary file if it exists
      if (pdfUri) {
        try {
          // This cleanup is good practice, especially on iOS where printToFileAsync 
          // might save to a cache directory.
          await FileSystem.deleteAsync(pdfUri, { idempotent: true });
        } catch (cleanupError) {
          // Log cleanup errors but don't fail the main process
          console.warn('Failed to clean up temporary PDF file:', cleanupError);
        }
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={handlePress}
      disabled={loading}
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Added for better centering of indicator
    minHeight: 44, // Ensure a minimum height
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});