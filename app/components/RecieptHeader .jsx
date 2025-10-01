// components/Header.js
import { StyleSheet, Text, View } from 'react-native';
import { getEthiopianDateWithAmharic } from '../EthiopianDate';


const Header = () => {
    const today = getEthiopianDateWithAmharic();
    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <Text style={styles.title}>🛒 የቀን ግብይት ማጠቃለያ</Text>
                <Text style={styles.subtitle}>
                    {today.fullDate}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'rgba(67, 246, 142, 0.47)',
        shadowColor: 'rgba(67, 246, 142, 0.47)',
        shadowOffset: { width: 0, height: 40 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginHorizontal: 10,
        marginTop: 10,
    },
    headerContent: {
        alignItems: 'center',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#ffff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
});


export default Header;