import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useESP32WebSocketStore } from '../stores/esp32WebSocketStore';
import { RootStackParamList } from '../navigation/AdaptiveAppNavigator';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StatItem {
    id: string;
    title: string;
    value: string | number;
    bgColorLight: string;
    bgColorDark: string;
    textStyle?: object;
    isItalic?: boolean;
}

const DashboardScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<DashboardNavigationProp>();
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { status } = useESP32WebSocketStore();
    
    // Variables derivadas del store
    const isConnected = status?.connected || false;
    const esp32Status = status;
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular carga de datos
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    const getStatsData = (): StatItem[] => {
        const userRole = user?.role_name || 'child';
        
        if (userRole === 'admin') {
            return [
                { id: '1', title: 'Total Mensajes', value: 50, bgColorLight: 'bg-blue-100', bgColorDark: 'bg-blue-800' },
                { id: '2', title: 'Mensaje Popular', value: '"¡Hola!"', bgColorLight: 'bg-green-100', bgColorDark: 'bg-green-800', textStyle: { fontSize: 14 }, isItalic: true },
                { id: '3', title: 'Categorías', value: 8, bgColorLight: 'bg-purple-100', bgColorDark: 'bg-purple-800' },
                { id: '4', title: 'Usuarios', value: 25, bgColorLight: 'bg-yellow-100', bgColorDark: 'bg-yellow-800' }
            ];
        } else if (userRole === 'tutor') {
            return [
                { id: '1', title: 'Mis Mensajes', value: 15, bgColorLight: 'bg-blue-100', bgColorDark: 'bg-blue-800' },
                { id: '2', title: 'Favorito', value: '"¡Buenos días!"', bgColorLight: 'bg-green-100', bgColorDark: 'bg-green-800', textStyle: { fontSize: 14 }, isItalic: true },
                { id: '3', title: 'Categorías', value: 5, bgColorLight: 'bg-purple-100', bgColorDark: 'bg-purple-800' },
                { id: '4', title: 'Mis Niños', value: 3, bgColorLight: 'bg-yellow-100', bgColorDark: 'bg-yellow-800' }
            ];
        } else {
            return [
                { id: '1', title: 'Mis Mensajes', value: 0, bgColorLight: 'bg-blue-100', bgColorDark: 'bg-blue-800' },
                { id: '2', title: 'Favorito', value: 'Ninguno aún', bgColorLight: 'bg-green-100', bgColorDark: 'bg-green-800', textStyle: { fontSize: 14 }, isItalic: true },
                { id: '3', title: 'Categorías', value: 8, bgColorLight: 'bg-purple-100', bgColorDark: 'bg-purple-800' },
                { id: '4', title: 'Usados Hoy', value: 0, bgColorLight: 'bg-yellow-100', bgColorDark: 'bg-yellow-800' }
            ];
        }
    };

    const getRecentActivity = (): string[] => {
        const userRole = user?.role_name || 'child';
        
        if (userRole === 'admin') {
            return [
                'Nuevo tutor registrado',
                'Categoría "Saludos" actualizada',
                'Sistema funcionando correctamente',
                '5 nuevos mensajes creados'
            ];
        } else if (userRole === 'tutor') {
            return [
                'Mensaje asignado a Ana',
                'Categoría "Emociones" configurada',
                'Niño Carlos practicó 3 frases',
                'Nueva sesión completada'
            ];
        } else {
            return [
                'Practiqué 5 frases nuevas',
                'Mi mensaje favorito cambió',
                'Completé mis ejercicios',
                '¡Buen trabajo hoy!'
            ];
        }
    };

    const getUserTitle = (): string => {
        const userRole = user?.role_name || 'child';
        const userName = user?.name || 'Usuario';
        
        if (userRole === 'admin') return 'Panel de Administración';
        if (userRole === 'tutor') return 'Panel de Tutor';
        return `¡Hola ${userName}!`;
    };

    const renderStatItem = ({ item }: { item: StatItem }) => (
        <View
            className={`rounded-xl p-4 shadow m-2 flex-1 ${isDark ? item.bgColorDark : item.bgColorLight}`}
            style={{ minWidth: 140, maxWidth: 160 }}
        >
            <Text
                className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}
                style={item.isItalic ? { fontStyle: 'italic', ...item.textStyle } : item.textStyle}
            >
                {item.value}
            </Text>
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {item.title}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    Cargando dashboard...
                </Text>
            </View>
        );
    }

    return (
        <View
            className={`flex-1 relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            style={{ paddingTop: insets.top }}
        >
            <ScrollView className='p-6 flex-1 mt-4' showsVerticalScrollIndicator={false}>
                <Text className={`text-3xl font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-black'}`}>
                    Dashboard
                </Text>
                
                <Text className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getUserTitle()}
                </Text>

                <FlatList
                    data={getStatsData()}
                    renderItem={renderStatItem}
                    keyExtractor={(item) => item.id}
                    horizontal={false}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    scrollEnabled={false}
                    contentContainerStyle={{ marginBottom: 20 }}
                />

                {/* Botón Monitor ESP32 */}
                <TouchableOpacity
                    className={`rounded-2xl p-6 mb-6 shadow-lg ${isDark ? 'bg-blue-800' : 'bg-blue-600'}`}
                    onPress={() => {
                        console.log('🔍 Navegando directamente a ESP32MonitorBridge...');
                        navigation.navigate('ESP32MonitorBridge');
                    }}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 8,
                    }}
                >
                    <View className="flex-row items-center justify-center">
                        <View className="mr-4">
                            <Text className="text-4xl">📟</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-bold mb-1">
                                Monitor ESP32
                            </Text>
                            <Text className="text-blue-100 text-sm mb-2">
                                Ver eventos en tiempo real del dispositivo
                            </Text>
                            <View className="flex-row items-center">
                                <View className={`w-3 h-3 rounded-full mr-2 ${status.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                                <Text className={`text-xs ${status.connected ? 'text-green-200' : 'text-red-200'}`}>
                                    {status.connected ? 'ESP32 Conectado' : 'ESP32 Desconectado'}
                                </Text>
                                {status.battery !== undefined && (
                                    <Text className="text-blue-200 text-xs ml-3">
                                        🔋 {status.battery || 0}% | 📁 Cat. {status.category || 1}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View className="ml-4">
                            <Text className="text-white text-2xl">➤</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View
                    className={`rounded-2xl p-6 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-24`}
                >
                    <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                        Actividad Reciente
                    </Text>
                    {getRecentActivity().map((item: string, index: number) => (
                        <Text
                            key={index}
                            className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}
                        >
                            {index + 1}. {item}
                        </Text>
                    ))}
                </View>
            </ScrollView>

            <BottomNavBar theme={theme} />
        </View>
    );
};

export default DashboardScreen;
