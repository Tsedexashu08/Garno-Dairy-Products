// components/Header.js
import { StyleSheet, Text, View } from 'react-native';
// import { getEthiopianDateWithAmharic } from '../EthiopianDate';
import { Link } from '@react-navigation/native';

const Header = () => {
    return (
        <View style={styles.header}>
                <Link to="/DailyReciept">
            <View style={styles.headerContent}>
                <Text style={styles.ttl}>ለገበያ ያቀረብናቸው ምርቶች</Text>
                <Text style={styles.subttl}>
                    ደንበኛ የፈለጋቸውን ምርቶችን ከመጠናቸው ጋር ከታች ይምረጡ
                </Text>
            </View>
                </Link>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: 'rgba(85, 180, 230, 0.5)',
        shadowColor: 'rgba(255, 255, 255, 0.4)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        height: 80,
       
    },
    headerContent: {
        alignItems: 'center',
    },
    ttl: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 5,
    },
    subttl: {
        fontSize: 14,
        color: '#ffff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,

    },
});

export default Header;