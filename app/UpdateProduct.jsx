import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/Database';

const DairyProductsShop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const inset = useSafeAreaInsets();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Products')
                .select('*');

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const startEditing = (product) => {
        setEditingProductId(product.product_id);
        setNewPrice(product.price.toString());
    };

    const cancelEditing = () => {
        setEditingProductId(null);
        setNewPrice('');
    };

    const updatePrice = async (productId) => {
        if (!newPrice || isNaN(parseFloat(newPrice))) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        const updatedPrice = parseFloat(newPrice);

        try {
            const { error } = await supabase
                .from('Products')
                .update({ price: updatedPrice })
                .eq('product_id', productId);

            if (error) throw error;

            // Update local state
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.product_id === productId
                        ? { ...product, price: updatedPrice }
                        : product
                )
            );

            setEditingProductId(null);
            setNewPrice('');
            Alert.alert('ተሳክቷል', 'በተሳካ ሁነታ ዋጋ ተቀይሯል!');
        } catch (err) {
            Alert.alert('Error', 'Failed to update price: ' + err.message);
            console.error('Error updating price:', err);
        }
    };

    const renderProductItem = (item) => (
        <View style={styles.productCard} key={item.product_id}>
            <Image
                source={{ uri: item.image }}
                style={styles.productImage}
            // defaultSource={require('../assets/placeholder-image.png')} // Add a placeholder
            />

            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.measurement}>{item.measurement}</Text>

                <View style={styles.priceSection}>
                    {editingProductId === item.product_id ? (
                        <View style={styles.editContainer}>
                            <TextInput
                                style={styles.priceInput}
                                value={newPrice}
                                onChangeText={setNewPrice}
                                keyboardType="decimal-pad"
                                placeholder="Enter new price"
                                autoFocus
                            />
                            <View style={styles.editButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={() => updatePrice(item.product_id)}
                                >
                                    <Text style={styles.buttonText}>ዋጋ ቀይር</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={cancelEditing}
                                >
                                    <Text style={styles.buttonText}>ተመለስ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.priceDisplay}>
                            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                            <TouchableOpacity
                                style={[styles.button, styles.editButton]}
                                onPress={() => startEditing(item)}
                            >
                                <Text style={styles.buttonText}>ዋጋ ቀይር</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <ImageBackground
                source={require('../assets/images/Bg.jpg')}
                style={styles.background}
            >
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4ebecdff" />
                    <Text style={styles.loadingText}>Loading( ትንሽ ይታገሱ )...</Text>
                </View>
            </ImageBackground>
        );
    }

    if (error) {
        return (
            <ImageBackground
                source={require('../assets/images/Bg.jpg')}
                style={styles.background}
            >


                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    return (
        <View style={{ flex: 1, paddingTop: inset.top, paddingBottom: inset.bottom, backgroundColor: 'transparent' }}>
            <ImageBackground
                source={require('../assets/images/Bg.jpg')}
                style={styles.background}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>ጋርኖ ምርቶች ዝርዝር</Text>
                        <Text style={styles.headerSubtitle}>ከታች የተዘረዘረን ምርት ዋጋ መከየር ይቻላል</Text>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        <View style={styles.productsGrid}>
                            {products.map(renderProductItem)}
                        </View>

                        {products.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No products found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',

    },
    background: {
        flex: 1,
        width: '100%',
        height: '100vh'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 20,
    },
    header: {
        backgroundColor: '#4ECDC4',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderRadius: 20,
        borderColor: '#E0E0E0',
        borderWidth: 4,
        margin: 10,
        marginBottom: 0,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E0F7FA',
        textAlign: 'center',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    productsGrid: {
        padding: 16,
        paddingBottom: 280,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 4,
    },
    measurement: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 12,
    },
    priceSection: {
        marginTop: 4,
    },
    priceDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    editContainer: {
        gap: 8,
    },
    priceInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F7FAFC',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    editButton: {
        backgroundColor: '#4ECDC4',
        marginLeft: 12,
    },
    saveButton: {
        backgroundColor: '#48BB78',
    },
    cancelButton: {
        backgroundColor: '#E53E3E',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 25,
        color: '#ffffff',
        textAlign: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 4 },
        textShadowRadius: 5,
    },
    errorText: {
        fontSize: 16,
        color: '#E53E3E',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#4ECDC4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#718096',
        textAlign: 'center',
    },
});

export default DairyProductsShop;