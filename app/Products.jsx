
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { supabase } from '../services/Database';
import Header from './components/Header';

const { width } = Dimensions.get('window');
// Android-specific constants
const ANDROID_STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;
const ANDROID_NAVIGATION_BAR_HEIGHT = Platform.OS === 'android' ? 24 : 0;

export default function DairyOrderComponent() {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');


    // Payment methods in Amharic
    const paymentMethods = [
        { value: 'ቴሌብር', label: 'ቴሌብር' },
        { value: 'ትራንስፈር', label: 'ትራንስፈር' },
        { value: 'ጥሬ ብር', label: 'ጥሬ ብር' }
    ];

    // Fetch products from Supabase
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (productId, value) => {

        setQuantities(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    const incrementQuantity = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    const decrementQuantity = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(0, (prev[productId] || 0) - 1)
        }));
    };

    const getReceiptItems = () => {
        return products
            .map((product) => {
                const qty = quantities[product.product_id] || 0;
                if (qty > 0) {
                    return {
                        ...product,
                        quantity: qty,
                        total: (qty * product.price).toFixed(2),
                    };
                }
                return null;
            })
            .filter(Boolean);
    };

    const getGrandTotal = () => {
        return getReceiptItems()
            .reduce((sum, item) => sum + parseFloat(item.total), 0)
            .toFixed(2);
    };

    const clearOrder = () => {
        setQuantities({});
        setSelectedPaymentMethod('');
    };

    const handleSaveOrder = () => {
        const orderItems = getReceiptItems();
        if (orderItems.length === 0) {
            Alert.alert('ማስታወሻ', 'እባክዎ ለመግዛት ምርቶችን ይምረጡ');
            return;
        }
        setPaymentModalVisible(true);
    };
    const snapPoints = ['15%', '50%', '90%'];
    const saveOrder = async () => {
        if (!selectedPaymentMethod) {
            Alert.alert('ማስታወሻ', 'እባክዎ የክፍያ ዘዴ ይምረጡ');
            return;
        }

        const orderItems = getReceiptItems();
        if (orderItems.length === 0) return;

        try {
            // Save sale to Supabase
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert([{
                    total_amount: getGrandTotal(),
                    payment_method: selectedPaymentMethod
                }])
                .select()
                .single();

            if (saleError) throw saleError;

            // Save sale items
            const saleItemsData = orderItems.map(item => ({
                sale_id: sale.sale_id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItemsData);

            if (itemsError) throw itemsError;

            // Show alert and clear order after user confirms
            Alert.alert(
                'በተሳካ ሁኔታ',
                'ትዕዛዝዎ ተመዝግቧል!',
                [
                    {
                        text: 'እሺ',
                        onPress: () => {
                            setPaymentModalVisible(false);
                            setTimeout(() => {
                                clearOrder();
                            }, 100);
                        }
                    }
                ],
                { cancelable: false }
            );
        } catch (err) {
            Alert.alert('ስህተት', 'ትዕዛዝ ሲመዘገብ ስህተት ተፈጥሯል: ' + err.message);
            console.error('Error saving order:', err);
        }
    };


    const cancelOrder = () => {
        Alert.alert(
            ' ለግዢ የተመረጡትን ሊሰርዙ ነው',
            ' ለግዢ የተመረጡትን ሊሰርዙ ነው',
            [
                {
                    text: 'ተመለስ',
                    style: 'cancel'
                },
                {
                    text: 'ሰርዝ',
                    onPress: () => {
                        setPaymentModalVisible(false);
                        setTimeout(() => {
                            clearOrder();
                        }, 100);
                    }
                }
            ],
            { cancelable: true }
        );
    }
    const renderProduct = ({ item }) => {
        const currentQuantity = quantities[item.product_id] || 0;

        return (

            <View style={styles.card}>
                <View style={styles.cardShadow} />
                <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDetails}>
                        {item.measurement} • ${item.price.toFixed(2)}
                    </Text>
                    {item.has_container && (
                        <Text style={styles.containerText}>✓ Includes Container</Text>
                    )}

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => decrementQuantity(item.product_id)}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.quantityInput}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            value={currentQuantity === 0 ? '' : String(currentQuantity)}
                            onChangeText={(value) => handleQuantityChange(item.product_id, value)}
                            accessibilityLabel={`Quantity for ${item.name}`}
                            maxLength={10}
                        />

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => incrementQuantity(item.product_id)}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, marginTop: ANDROID_STATUS_BAR_HEIGHT, marginBottom: ANDROID_NAVIGATION_BAR_HEIGHT }}>
                <ImageBackground
                    source={require('../assets/images/Bg.jpg')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    <Header />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4ECDC4" />
                        <Text style={styles.loadingText}>Loading Products...</Text>
                    </View>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, marginTop: ANDROID_STATUS_BAR_HEIGHT, marginBottom: ANDROID_NAVIGATION_BAR_HEIGHT }}>
                <ImageBackground
                    source={require('../assets/images/Bg.jpg')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    <Header />

                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Error: {error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/images/Bg.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={{ flex: 1, marginTop: ANDROID_STATUS_BAR_HEIGHT, marginBottom: ANDROID_NAVIGATION_BAR_HEIGHT }}>
                <Header />
                {/* <ErrorCard title="የሞባይል ዳታዎን ወይም ዋይፋይ ያብሩ !"/> */}
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.product_id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={true}
                />

                {/* Enhanced Receipt Section */}

                <View style={styles.receiptContainer}>
                    <View style={styles.receiptHeader}>
                        <Text style={styles.receiptTitle}>🛒 የሂሳብ ማጠቃለይ</Text>
                    </View>

                    <ScrollView
                        style={styles.receiptItems}
                        showsVerticalScrollIndicator={false}
                    >
                        {getReceiptItems().length === 0 ? (
                            <Text style={styles.emptyReceipt}>ለግዢ የተመረጠ ምርት የለም</Text>
                        ) : (
                            getReceiptItems().map((item, idx) => (
                                <View key={`${item.product_id}-${idx}`} style={styles.receiptItem}>
                                    <View style={styles.receiptItemLeft}>
                                        <Text style={styles.receiptItemName}>{item.name}</Text>
                                        <Text style={styles.receiptItemQuantity}>
                                            {item.quantity} x ${item.price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <Text style={styles.receiptItemTotal}>${item.total}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {getReceiptItems().length > 0 && (
                        <View style={styles.totalSection}>
                            <View style={styles.totalDivider} />
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>አጠቃላይ ሂሳብ:</Text>
                                <Text style={styles.totalAmount}>${getGrandTotal()}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.receiptActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.clearButton, getReceiptItems().length === 0 && styles.disabledButton]}
                            onPress={cancelOrder}
                            disabled={getReceiptItems().length === 0}
                        >
                            <Text style={styles.clearButtonText}>ግዢ ሰርዝ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.saveButton, getReceiptItems().length === 0 && styles.disabledButton]}
                            onPress={handleSaveOrder}
                            disabled={getReceiptItems().length === 0}
                        >
                            <Text style={styles.saveButtonText}>ሂሳብ መዝግብ</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Payment Method Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={paymentModalVisible}
                    onRequestClose={() => setPaymentModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>የክፍያ ዘዴ ይምረጡ</Text>
                            <Text style={styles.modalSubtitle}>Select Payment Method</Text>

                            {paymentMethods.map((method) => (
                                <TouchableOpacity
                                    key={method.value}
                                    style={[
                                        styles.paymentOption,
                                        selectedPaymentMethod === method.value && styles.selectedPaymentOption
                                    ]}
                                    onPress={() => setSelectedPaymentMethod(method.value)}
                                >
                                    <Text style={[
                                        styles.paymentOptionText,
                                        selectedPaymentMethod === method.value && styles.selectedPaymentOptionText
                                    ]}>
                                        {method.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setPaymentModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>ግዢ ሰርዝ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={saveOrder}
                                    disabled={!selectedPaymentMethod}
                                >
                                    <Text style={styles.confirmButtonText}>ሂሳብ መዝግብ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 20
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        textAlign: 'center',
        marginBottom: 20
    },
    retryButton: {
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    listContainer: {
        padding: 10,
        paddingBottom: 300,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        margin: 8,
        width: width / 2 - 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    cardShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 4,
    },
    productDetails: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 4,
    },
    containerText: {
        fontSize: 12,
        color: '#27ae60',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 8,
    },
    quantityButton: {
        width: 32,
        height: 32,
        backgroundColor: '#4ECDC4',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    quantityInput: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 6,
        textAlign: 'center',
        backgroundColor: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    receiptContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: 350,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    receiptHeader: {
        alignItems: 'center',
        marginBottom: 12,
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    receiptItems: {
        maxHeight: 150,
    },
    receiptItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    receiptItemLeft: {
        flex: 1,
    },
    receiptItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    receiptItemQuantity: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    receiptItemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    emptyReceipt: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
    totalSection: {
        marginTop: 8,
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#bdc3c7',
        marginVertical: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    receiptActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clearButton: {
        backgroundColor: '#e74c3c',
    },
    saveButton: {
        backgroundColor: '#27ae60',
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
        opacity: 0.6,
    },
    clearButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#2c3e50',
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#7f8c8d',
    },
    paymentOption: {
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f8f9fa',
    },
    selectedPaymentOption: {
        backgroundColor: '#4ECDC4',
        borderColor: '#4ECDC4',
    },
    paymentOptionText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#2c3e50',
    },
    selectedPaymentOptionText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    confirmButton: {
        backgroundColor: '#27ae60',
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});