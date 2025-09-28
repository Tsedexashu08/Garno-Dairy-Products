// components/CartSummary.js
import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const CartSummary = ({ cart, onCheckout, onClearCart }) => {
    // SIMPLIFIED: Calculate totals directly from cart
    const calculateTotals = () => {
        if (!cart || Object.keys(cart).length === 0) {
            return { totalItems: 0, totalPrice: 0, cartItemsCount: 0 };
        }

        let totalItems = 0;
        let totalPrice = 0;

        Object.values(cart).forEach(cartItem => {
            if (cartItem && cartItem.quantity > 0 && cartItem.product) {
                totalItems += cartItem.quantity;
                totalPrice += cartItem.quantity * cartItem.product.price;
            }
        });

        return { 
            totalItems, 
            totalPrice, 
            cartItemsCount: Object.keys(cart).length 
        };
    };

    const { totalItems, totalPrice, cartItemsCount } = calculateTotals();

    if (totalItems === 0) {
        return (
            <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={40} color="#CBD5E0" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubText}>Add some products to get started</Text>
            </View>
        );
    }

    return (
        <View style={styles.cartSummary}>
            <View style={styles.cartHeader}>
                <View style={styles.cartTitleContainer}>
                    <Ionicons name="cart" size={20} color="#4A6572" />
                    <Text style={styles.cartTitle}>Your Order ({totalItems} items)</Text>
                </View>
                <TouchableOpacity onPress={onClearCart} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cartDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Items:</Text>
                    <Text style={styles.detailValue}>{cartItemsCount} different products</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Quantity:</Text>
                    <Text style={styles.detailValue}>{totalItems}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={onCheckout}
                activeOpacity={0.8}
            >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyCart: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    emptyCartText: {
        fontSize: 16,
        color: '#718096',
        marginTop: 8,
    },
    emptyCartSubText: {
        fontSize: 14,
        color: '#A0AEC0',
        marginTop: 4,
    },
    cartSummary: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cartTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginLeft: 8,
    },
    clearButton: {
        padding: 6,
    },
    clearButtonText: {
        color: '#F56565',
        fontSize: 14,
        fontWeight: '600',
    },
    cartDetails: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#718096',
    },
    detailValue: {
        fontSize: 14,
        color: '#2D3748',
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    totalLabel: {
        fontSize: 16,
        color: '#2D3748',
        fontWeight: '600',
    },
    totalPrice: {
        fontSize: 18,
        color: '#48BB78',
        fontWeight: 'bold',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#48BB78',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        shadowColor: '#48BB78',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default CartSummary;