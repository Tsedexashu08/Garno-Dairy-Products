import { FontAwesome } from '@expo/vector-icons';
import 'expo-dev-client';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';




const Home = () => {
             return (
               <ImageBackground
                 source={require('../assets/images/Bg.jpg')}
                 style={styles.background}
                 >
                 <View style={styles.container}>
                   <Text style={styles.title}>ጋርኖ የወተት ምርቶች</Text>
                   <Text style={styles.subtitle}>የተለያዩ የምርት ግብይቶች ያስተዳድሩ</Text>
           
                   <View style={styles.buttonContainer}>
                     <TouchableOpacity style={[styles.button, styles.predictButton]}  >
                       <View style={styles.buttonContent}>
                         <FontAwesome name="money" size={32} color="#ffff" />
                         <View style={styles.buttonTextContainer}>
                           <Text style={styles.buttonText}>ሽያጭ ፈጽም</Text>
                           <Text style={styles.buttonSubtext}>ምርቶችን ለመሸጥ ይህን ይንኩ</Text>
                         </View>
                       </View>
                     </TouchableOpacity>
           
                     {/* <Link href={'/Add'}> */}
                     <TouchableOpacity style={[styles.button, styles.rateButton]}>
                       <View style={styles.buttonContent}>
                         <FontAwesome name="money" size={32} color="#FFD700" />
                         <View style={styles.buttonTextContainer}>
                           <Text style={styles.buttonText}>የቀን ገቢ አሳይ</Text>
                           <Text style={styles.buttonSubtext}>የዛሬን አጠቃላይ ገቢ ለማየት</Text>
                         </View>
                       </View>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.button, styles.rateButton]}>
                       <View style={styles.buttonContent}>
                         <FontAwesome name="plus" size={32} color="#FFD700" />
                         <View style={styles.buttonTextContainer}>
                           <Text style={styles.buttonText}>አዲስ ምርት ጨምር</Text>
                           <Text style={styles.buttonSubtext}>ወደ ሱቅ የገባ አዲስ ምርት ልመጨመር</Text>
                         </View>
                       </View>
                     </TouchableOpacity>
                     {/* </Link> */}
                   </View>
                   {/* 
                   <View style={styles.statsContainer}>
                     <View style={styles.statItem}>
                       <Text style={styles.statNumber}>15</Text>
                       <Text style={styles.statLabel}>Todays Predictions</Text>
                     </View>
                     <View style={styles.statDivider} />
                     <View style={styles.statItem}>
                       <Text style={styles.statNumber}>1.2K</Text>
                       <Text style={styles.statLabel}>Total Predictions</Text>
                     </View>
                     <View style={styles.statDivider} />
                     <View style={styles.statItem}>
                       <Text style={styles.statNumber}>85%</Text>
                       <Text style={styles.statLabel}>Accuracy Rate</Text>
                     </View>
                   </View> */}
                 </View>
               </ImageBackground>
           
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100vh'
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    // Glass effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(10px)',
  },
  watchButton: {
    borderWidth: 1,
    borderColor: 'rgba(135, 250, 148, 0.3)',
    shadowColor: '#87CEFA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  predictButton: {
    backgroundColor: 'rgba(78, 205, 167, 0.45)',
    borderColor: 'rgba(78, 205, 196, 0.25)',
  },
  historyButton: {
    backgroundColor: 'rgba(255, 230, 109, 0.55)',
    borderColor: 'rgba(255, 230, 109, 0.25)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    marginLeft: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    width: '110%',
    // Glass effect to match buttons
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(10px)', // This will work on web
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },
});

export default Home;