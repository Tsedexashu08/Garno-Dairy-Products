// components/ProductCard.js
import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ProductCard = ({ item, cartItem, onAddToCart, onRemoveFromCart }) => {
    const quantity = cartItem?.quantity || 0;
    
    // User-friendly measurement display with container logic
    const getMeasurementText = () => {
        if (item.has_container) {
            return "Includes Container (30 units)";
        }
        
        switch(item.measurement) {
            case 'weight':
                return "Per Kilogram";
            case 'volume':
                return "Per Liter";
            case 'unit':
                return "Per Item";
            default:
                return "Per Item";
        }
    };

    // Simple price display
    const displayPrice = `$${item.price.toFixed(2)}`;

    const handleAddPress = () => {
        onAddToCart();
    };

    const handleRemovePress = () => {
        if (quantity <= (item.has_container ? 30 : 1)) {
            Alert.alert(
                "Remove Item",
                `Remove ${item.name} from cart?`,
                [
                    { text: "Keep", style: "cancel" },
                    { text: "Remove", onPress: onRemoveFromCart }
                ]
            );
        } else {
            onRemoveFromCart();
        }
    };

    const handleLongPress = () => {
        const containerInfo = item.has_container ? 
            "\n📦 Includes container (adds 30 units)" : 
            "\n📦 No container (adds 1 unit)";
            
        Alert.alert(
            item.name,
            `Price: ${displayPrice}\nMeasurement: ${getMeasurementText()}${containerInfo}`,
            [{ text: "OK" }]
        );
    };

    return (
        <TouchableOpacity 
            style={styles.productCard}
            onLongPress={handleLongPress}
            activeOpacity={0.9}
        >
            <View style={styles.cardContent}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: item.image }} 
                        style={styles.productImage}
                        // defaultSource={require('../assets/images/placeholder.png')}
                    />
                    {quantity > 0 && (
                        <View style={styles.quantityBadge}>
                            <Text style={styles.quantityBadgeText}>{quantity}</Text>
                        </View>
                    )}
                    {item.has_container && (
                        <View style={styles.containerBadge}>
                            <Text style={styles.containerBadgeText}>📦</Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    
                    <Text style={styles.measurementText}>
                        {getMeasurementText()}
                    </Text>
                    
                    <Text style={styles.productPrice}>
                        {displayPrice}
                    </Text>

                    {/* Add/Remove Controls */}
                    <View style={styles.controlsContainer}>
                        {quantity > 0 ? (
                            <View style={styles.quantityControls}>
                                <TouchableOpacity 
                                    style={[styles.controlButton, styles.removeButton]}
                                    onPress={handleRemovePress}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="remove" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                                
                                <Text style={styles.quantityText}>
                                    {quantity} {item.has_container ? 'units' : 'items'}
                                </Text>
                                
                                <TouchableOpacity 
                                    style={[styles.controlButton, styles.addButton]}
                                    onPress={handleAddPress}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.addToCartButton}
                                onPress={handleAddPress}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="cart" size={18} color="#FFFFFF" />
                                <Text style={styles.addToCartText}>
                                    {item.has_container ? 'Add Container' : 'Add to Cart'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    productCard: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardContent: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 140,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    quantityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF6B6B',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    quantityBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    containerBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerBadgeText: {
        fontSize: 12,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 4,
        lineHeight: 20,
    },
    measurementText: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#48BB78',
        marginBottom: 12,
    },
    controlsContainer: {
        marginTop: 'auto',
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A6572',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#4A6572',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addToCartText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    controlButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    addButton: {
        backgroundColor: '#48BB78',
    },
    removeButton: {
        backgroundColor: '#F56565',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
        textAlign: 'center',
        flex: 1,
    },
});

export default ProductCard;