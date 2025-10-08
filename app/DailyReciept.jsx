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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/Database';
import DailyReportShareButton from './components/GeneratePdf';
import RecieptHeader from './components/RecieptHeader ';
import getEthiopianDateWithAmharic from './EthiopianDate';

export default function SalesReceiptComponent() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);
  const insets = useSafeAreaInsets();

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
        .gte('created_at', new Date().toISOString().split('T')[0]) // Today's date only
        .lt('created_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]) // Tomorrow's date
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
  }, 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  });

  // Calculate product statistics
const getProductStatistics = () => {
  const productStats = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const productName = item.product_name;
      if (!productStats[productName]) {
        productStats[productName] = {
          name: productName,
          totalQuantity: 0,
          totalRevenue: 0,
          measurement: item.measurement
        };
      }
      productStats[productName].totalQuantity += item.quantity;
      productStats[productName].totalRevenue += parseFloat(item.item_total);
    });
  });

  return Object.values(productStats).sort((a, b) => b.totalRevenue - a.totalRevenue);
};

const productStatistics = getProductStatistics();
const totalProductsSold = productStatistics.reduce((total, product) => total + product.totalQuantity, 0);
const totalTransactions = sales.length;
const numberOfProductTypes = productStatistics.length; // This counts the different types of products
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
            Alert.alert('በተሳካ ሁኔታ', 'ሪፖርትዎ ተሰቅሏል!');
          },
        },
      ]
    );
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

    // Add 3 hours to the date
    const frmtedDate = new Date(new Date(sale.created_at).getTime() + (3 * 60 * 60 * 1000)).toLocaleString('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const time = new Date(new Date(sale.created_at).getTime() + (3 * 60 * 60 * 1000)).toLocaleTimeString('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardShadow} />
        <TouchableOpacity onPress={handlePress} style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.saleId}>ዛሬ -{time}</Text>
              <Text style={styles.date}>{(frmtedDate)}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.totalAmount}>${sale.total_amount.toLocaleString('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 3
              })} ብር</Text>
              <Text style={styles.paymentMethod}>
                ክፍያ - በ{getPaymentMethodText(sale.payment_method)}
              </Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Text style={styles.expandIcon}>↓</Text>
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsTitle}>የሽያጭ ዝርዝር</Text>
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

 
const SalesSummaryCard = () => (
  <View style={summaryCardStyles.container}>
    <View style={summaryCardStyles.header}>
      <Text style={summaryCardStyles.title}>📊 የዛሬ ሽያጭ ማጠቃለያ</Text>
      <View style={summaryCardStyles.dateBadge}>
        <Text style={summaryCardStyles.dateText}>{getEthiopianDateWithAmharic(new Date()).fullDate}</Text>
      </View>
    </View>

    <View style={summaryCardStyles.statsGrid}>
      <View style={summaryCardStyles.statItem}>
        <Text style={summaryCardStyles.statValue}>${totalSalesAmount}</Text>
        <Text style={summaryCardStyles.statLabel}>ጠቅላላ ሽያጭ</Text>
      </View>
      <View style={summaryCardStyles.statItem}>
        <Text style={summaryCardStyles.statValue}>{totalTransactions}</Text>
        <Text style={summaryCardStyles.statLabel}>ግብይቶች</Text>
      </View>
      <View style={summaryCardStyles.statItem}>
        <Text style={summaryCardStyles.statValue}>{numberOfProductTypes}</Text>
        <Text style={summaryCardStyles.statLabel}>የተለያዩ ምርቶች</Text>
      </View>
    </View>

    {productStatistics.length > 0 && (
      <View style={summaryCardStyles.productsSection}>
        <Text style={summaryCardStyles.productsTitle}>በምርት ሽያጭ</Text>
        {productStatistics.map((product, index) => (
          <View key={index} style={summaryCardStyles.productRow}>
            <View style={summaryCardStyles.productInfo}>
              <Text style={summaryCardStyles.productName}>{product.name}</Text>
              <Text style={summaryCardStyles.productDetails}>
                {product.totalQuantity} {product.measurement} ተሽጧል
              </Text>
            </View>
            <Text style={summaryCardStyles.productRevenue}>
              ${product.totalRevenue.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    )}
  </View>
);
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, marginTop: insets.top, marginBottom: insets.bottom }}>
        <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
        <ImageBackground
          source={'../assets/images/Bg.jpg'}
          style={styles.background}
          resizeMode="cover"
        >
          <RecieptHeader />
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
      <SafeAreaView style={{ flex: 1, marginTop: insets.top, marginBottom: insets.bottom }}>
        <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
        <ImageBackground
          source={require('../assets/images/Bg.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <RecieptHeader />
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
    <SafeAreaView style={{ flex: 1, marginTop: insets.top, marginBottom: insets.bottom }}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      <ImageBackground
        source={require('../assets/images/Bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <RecieptHeader />
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
          ListHeaderComponent={sales.length > 0 ? <SalesSummaryCard /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>ዛሬ የተደረገ ግብይት የለም</Text>
              <Text style={styles.emptyText}>
                ዛሬ የተደረጉ ግብይቶች አልተገኙም። ምርቶችን ለመሸጥ ወደ ሽያጭ ገፅ ይሂዱ።
              </Text>
            </View>
          }
        />
        <SalesSummarySection
          totalSales={totalSalesAmount}
          onSave={handleSaveReport}
          salesData={sales}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

// Sales Summary Card Styles
const summaryCardStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderLeftWidth: 6,
    borderLeftColor: '#667eea',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  dateBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    textAlign: 'center',
  },
  productsSection: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 16,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

// Rest of the styles remain the same...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
    paddingBottom: 120,
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
    color: '#56c1f6ff',
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 18,
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
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
    paddingBottom: 8,
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
const SalesSummarySection = ({ totalSales, onSave, salesData }) => {
  return (
    <View style={summaryStyles.summaryContainer}>
      <View style={summaryStyles.summaryContent}>
        <View style={summaryStyles.totalSection}>
          <Text style={summaryStyles.totalLabel}>የዛሬ ጠቅላላ ሽያጭ</Text>
          <Text style={summaryStyles.totalAmount}>${totalSales} ብር</Text>
        </View>

        <DailyReportShareButton
          salesData={salesData}
          fileName={`${getEthiopianDateWithAmharic(new Date()).fullDate}-የቀን-ሪፖርት.pdf`}
          buttonText="የቀን ገቢን መዝግብ"
          class={summaryStyles.saveButtonText}
        />
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
    fontSize: 18,
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
