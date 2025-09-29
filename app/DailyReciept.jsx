import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../services/Database';
import RecieptHeader from './components/RecieptHeader ';

// const { width } = Dimensions.get('window');

export default function SalesReceiptComponent() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);

  // Fetch sales data with product details
  const fetchSalesData = useCallback(async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          sale_id,
          total_amount,
          payment_method,
          created_at,
          sale_items (
            quantity,
            unit_price,
            Products (
              name,
              measurement
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to group items by sale
      const transformedSales = data.map(sale => ({
        sale_id: sale.sale_id,
        total_amount: sale.total_amount,
        payment_method: sale.payment_method,
        created_at: sale.created_at,
        items: sale.sale_items.map(item => ({
          product_name: item.Products.name,
          measurement: item.Products.measurement,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_total: (item.quantity * item.unit_price).toFixed(2)
        }))
      }));

      setSales(transformedSales);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSalesData();
  }, [fetchSalesData]);

  const toggleExpand = (saleId) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };
  const totalSalesAmount = sales.reduce((total, sale) => {
  return total + parseFloat(sale.total_amount || 0);
}, 0).toFixed(2);

 const handleSaveReport = () => {
  Alert.alert(
    'ሪፖርት አረጋግጥ',
    `የቀን ሪፖርት ማስቀመጥ ትፈልጋለህ? \nጠቅላላ ሽያጭ: $${totalSalesAmount}`,
    [
      {
        text: 'ሰርዝ',
        style: 'cancel',
      },
      {
        text: 'አረጋግጥ',
        onPress: () => {
          // Here you can add logic to save the report
          // For example: save to database, generate PDF, etc.
          Alert.alert('በተሳካ ሁኔታ', 'ሪፖርትዎ ተሰቅሏል!');
        },
      },
    ]
  );
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' • ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method) => {
    const paymentMethods = {
      'ቴሌብር': 'ቴሌብር',
      'ትራንስፈር': 'ትራንስፈር',
      'ጥሬ ብር': 'ጥሬ ብር'
    };
    return paymentMethods[method] || method;
  };

  const ReceiptCard = ({ sale }) => {
    const isExpanded = expandedSale === sale.sale_id;
    const rotateAnim = useState(new Animated.Value(0))[0];

    const toggleAnimation = () => {
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });

    const handlePress = () => {
      toggleAnimation();
      toggleExpand(sale.sale_id);
    };
   
   
    return (
      <View style={styles.card}>
        <View style={styles.cardShadow} />
        <TouchableOpacity onPress={handlePress} style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.saleId}>Sale #{sale.sale_id}</Text>
              <Text style={styles.date}>{formatDate(sale.created_at)}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.totalAmount}>${sale.total_amount}</Text>
              <Text style={styles.paymentMethod}>
                {getPaymentMethodText(sale.payment_method)}
              </Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Text style={styles.expandIcon}>▼</Text>
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsTitle}>Items Sold</Text>
            </View>
            {sale.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemMeasurement}>{item.measurement}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} × ${item.unit_price}
                  </Text>
                  <Text style={styles.itemTotal}>${item.item_total}</Text>
                </View>
              </View>
            ))}
            <View style={styles.finalTotal}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalAmount}>${sale.total_amount}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
        <ImageBackground
          source={'../assets/images/Bg.jpg'}
          style={styles.background}
          resizeMode="cover"
        >
          <RecieptHeader  />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading Sales History...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
        <ImageBackground
          source={require('../assets/images/Bg.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <RecieptHeader  />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSalesData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      <ImageBackground
        source={require('../assets/images/Bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <RecieptHeader  />
        <FlatList
          data={sales}
          renderItem={({ item }) => <ReceiptCard sale={item} />}
          keyExtractor={(item) => item.sale_id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4ECDC4']}
              tintColor="#4ECDC4"
            />
      
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Sales Found</Text>
              <Text style={styles.emptyText}>
                Sales records will appear here once orders are completed.
              </Text>
            </View>
          }
        />
                  <SalesSummarySection 
  totalSales={totalSalesAmount}
  onSave={handleSaveReport}
/>
    
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    marginBottom: 16,
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
  cardHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  saleId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  expandedContent: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  itemsHeader: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  itemMeasurement: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#ecf0f1',
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  finalTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// SalesSummarySection Component (add this outside your main component)
const SalesSummarySection = ({ totalSales, onSave }) => {
  return (
    <View style={summaryStyles.summaryContainer}>
      <View style={summaryStyles.summaryContent}>
        <View style={summaryStyles.totalSection}>
          <Text style={summaryStyles.totalLabel}>ጠቅላላ ሽያጭ</Text>
          <Text style={summaryStyles.totalAmount}>${totalSales}</Text>
        </View>
        
        <TouchableOpacity 
          style={summaryStyles.saveButton}
          onPress={onSave}
        >
          <Text style={summaryStyles.saveButtonText}>📋 ሪፖርት አስቀምጥ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add these styles to your existing StyleSheet
const summaryStyles = StyleSheet.create({
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Extra padding for iOS home indicator
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

// Also update your FlatList to account for the bottom section
// Change the contentContainerStyle in your FlatList to:
