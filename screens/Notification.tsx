import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react-native';

const notifications = [
    {
        id: '1',
        type: 'info',
        title: 'Nuevo botón añadido',
        message: 'Se agregó el botón “Tengo sed” a tu panel.',
        date: '2025-07-05',
    },
    {
        id: '2',
        type: 'alert',
        title: 'Uso frecuente',
        message: 'La frase “Quiero ir al baño” se ha usado 5 veces hoy.',
        date: '2025-07-05',
    },
    {
        id: '3',
        type: 'success',
        title: 'Frase configurada',
        message: 'Tu nueva frase “Vamos a jugar” fue guardada correctamente.',
        date: '2025-07-04',
    },
];

const getIcon = (type: string, color: string) => {
    switch (type) {
        case 'info':
            return <Bell size={24} color={color} />;
        case 'success':
            return <CheckCircle size={24} color={color} />;
        case 'alert':
            return <AlertTriangle size={24} color={color} />;
        default:
            return <Bell size={24} color={color} />;
    }
};

const NotificationsScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();

    const renderItem = ({ item }: { item: typeof notifications[0] }) => {
        const iconColor = isDark ? '#60a5fa' : '#2563eb'; // azul claro u oscuro

        return (
            <View
                className={`flex-row items-start gap-4 mb-4 p-4 rounded-xl shadow ${isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
            >
                <View className="mt-1">
                    {getIcon(item.type, iconColor)}
                </View>
                <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                        {item.title}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.message}
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.date}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View
            className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            style={{ paddingTop: insets.top }}
        >
            <View className={`flex-1 mt-12 px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} >
                <View >
                    <Text className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                        Notificaciones
                    </Text>

                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
            </View>


            <BottomNavBar theme={theme} />
        </View>
    );
};

export default NotificationsScreen;
