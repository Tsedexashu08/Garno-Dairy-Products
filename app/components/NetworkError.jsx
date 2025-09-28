import { Ionicons } from '@expo/vector-icons'; // or any other icon library
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ErrorCard = ({
    title = "lorem ipsum dolor sit amet",
    onClose,
    style
}) => {
    return (
        <View style={[styles.error, style]}>
            <View style={styles.error__icon}>
                <Ionicons name="warning" size={20} color="#fff" />
            </View>
            <Text style={styles.error__title}>{title}</Text>
            {onClose && (
                <TouchableOpacity style={styles.error__close} onPress={onClose}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    error: {
        width: 320,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#EF665B',
        borderRadius: 8,
        shadowColor: '#111',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
        position: 'absolute',
        left: 50,
        right: 50,
        top: 150,
        zIndex: 1000,
    },
    error__icon: {
        marginRight: 8,
        transform: [{ translateY: -1 }],
    },
    error__title: {
        fontFamily: 'System',
        fontWeight: '900',
        fontSize: 16,
        color: '#fff',
        flex: 1,
    },
    error__close: {
        marginLeft: 'auto',
    },
});

export default ErrorCard;