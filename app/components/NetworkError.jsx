import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ErrorCard = ({
    title = "የሞባይል ዳታዎን ወይም ዋይፋይ ያብሩ!",
    timeout = 5000, // 5 seconds default
    style,
    showCloseButton = true
}) => {
    const [isConnected, setIsConnected] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected ?? false;
            setIsConnected(connected);
            
            // Show error card when disconnected
            if (!connected) {
                setIsVisible(true);
            } else {
                // Hide immediately when reconnected
                setIsVisible(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let timeoutId;
        
        // Auto-hide after timeout when disconnected
        if (isVisible && !isConnected) {
            timeoutId = setTimeout(() => {
                setIsVisible(false);
            }, timeout);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isVisible, isConnected, timeout]);

    const handleClose = () => {
        setIsVisible(false);
    };

    // Don't render anything if connected or not visible
    if (isConnected || !isVisible) {
        return null;
    }

    return (
        <View style={[styles.error, style]}>
            <View style={styles.error__icon}>
                <Ionicons name="wifi-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.error__title}>{title}</Text>
            {showCloseButton && (
                <TouchableOpacity style={styles.error__close} onPress={handleClose}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

// Alternative version with custom message and manual control
const NetworkErrorCard = ({
    isVisible: externalIsVisible,
    onClose,
    title = "የሞባይል ዳታዎን ወይም ዋይፋይ ያብሩ!",
    timeout = 5000,
    style,
    showCloseButton = true
}) => {
    const [internalIsVisible, setInternalIsVisible] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    const isVisible = externalIsVisible !== undefined ? externalIsVisible : internalIsVisible;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected ?? false;
            setIsConnected(connected);
            
            if (!connected) {
                setInternalIsVisible(true);
            } else {
                setInternalIsVisible(false);
                onClose?.();
            }
        });

        return () => unsubscribe();
    }, [onClose]);

    useEffect(() => {
        let timeoutId;
        
        if (isVisible && !isConnected) {
            timeoutId = setTimeout(() => {
                setInternalIsVisible(false);
                onClose?.();
            }, timeout);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isVisible, isConnected, timeout, onClose]);

    const handleClose = () => {
        setInternalIsVisible(false);
        onClose?.();
    };

    if (isConnected || !isVisible) {
        return null;
    }

    return (
        <View style={[styles.error, style]}>
            <View style={styles.error__icon}>
                <Ionicons name="cloud-offline-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.error__title}>{title}</Text>
            {showCloseButton && (
                <TouchableOpacity style={styles.error__close} onPress={handleClose}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    error: {
        width: '85%',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#EF665B',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        position: 'absolute',
        alignSelf: 'center',
        top: 60,
        zIndex: 1000,
        borderLeftWidth: 4,
        borderLeftColor: '#D93025',
    },
    error__icon: {
        marginRight: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 4,
    },
    error__title: {
        fontFamily: 'System',
        fontWeight: '600',
        fontSize: 14,
        color: '#fff',
        flex: 1,
        lineHeight: 18,
    },
    error__close: {
        marginLeft: 'auto',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        padding: 4,
    },
});

export { NetworkErrorCard };
export default ErrorCard;