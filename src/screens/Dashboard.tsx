import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useESP32WebSocketStore } from '../stores/esp32WebSocketStore';
import { RootStackParamList } from '../navigation/AdaptiveAppNavigator';
import { dashboardService, DashboardStats, DashboardActivity } from '../services/dashboardService';

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
    const [stats, setStats] = useState<DashboardStats>({});
    const [activity, setActivity] = useState<DashboardActivity[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, activityData] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getActivity()
            ]);
            setStats(statsData);
            setActivity(activityData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getStatsData = (): StatItem[] => {
        const userRole = user?.role_name || 'niño';
        
        if (userRole === 'administrador') {
            return [
                { 
                    id: '1', 
                    title: 'Total Usuarios', 
                    value: stats.totalUsers || 0, 
                    bgColorLight: 'bg-blue-100', 
                    bgColorDark: 'bg-blue-800' 
                },
                // { 
                //     id: '2', 
                //     title: 'Total Mensajes', 
                //     value: stats.totalMessagesAdmin || 0, 
                //     bgColorLight: 'bg-green-100', 
                //     bgColorDark: 'bg-green-800' 
                // },
                // { 
                //     id: '3', 
                //     title: 'Categorías', 
                //     value: stats.totalCategories || 0, 
                //     bgColorLight: 'bg-purple-100', 
                //     bgColorDark: 'bg-purple-800' 
                // },
                // { 
                //     id: '4', 
                //     title: 'Relaciones', 
                //     value: stats.totalRelations || 0, 
                //     bgColorLight: 'bg-yellow-100', 
                //     bgColorDark: 'bg-yellow-800' 
                // }
            ];
        } else if (userRole === 'tutor') {
            return [
                // { 
                //     id: '1', 
                //     title: 'Mis Mensajes', 
                //     value: stats.myMessages || 0, 
                //     bgColorLight: 'bg-blue-100', 
                //     bgColorDark: 'bg-blue-800' 
                // },
                // { 
                //     id: '2', 
                //     title: 'Mis Niños', 
                //     value: stats.myChildren || 0, 
                //     bgColorLight: 'bg-green-100', 
                //     bgColorDark: 'bg-green-800' 
                // },
                // { 
                //     id: '3', 
                //     title: 'Mensajes Asignados', 
                //     value: stats.assignedMessages || 0, 
                //     bgColorLight: 'bg-purple-100', 
                //     bgColorDark: 'bg-purple-800' 
                // },
                // { 
                //     id: '4', 
                //     title: 'ESP32 Estado', 
                //     value: isConnected ? 'Conectado' : 'Desconectado', 
                //     bgColorLight: 'bg-yellow-100', 
                //     bgColorDark: 'bg-yellow-800',
                //     textStyle: { fontSize: 14 }, 
                //     isItalic: true 
                // }
            ];
        } else {
            // Para rol 'niño' - datos reales del dashboard
            return [
                { 
                    id: '1', 
                    title: 'Mis Mensajes', 
                    value: stats.totalMessages || 0, 
                    bgColorLight: 'bg-blue-100', 
                    bgColorDark: 'bg-blue-800' 
                },
                { 
                    id: '2', 
                    title: 'Favoritos', 
                    value: stats.favoriteMessages || 0, 
                    bgColorLight: 'bg-green-100', 
                    bgColorDark: 'bg-green-800' 
                },
                // { 
                //     id: '3', 
                //     title: 'Categorías', 
                //     value: stats.totalCategories || 0, 
                //     bgColorLight: 'bg-purple-100', 
                //     bgColorDark: 'bg-purple-800' 
                // },
                { 
                    id: '4', 
                    title: 'Total Aprendido', 
                    value: (stats.totalMessages || 0) + (stats.favoriteMessages || 0), 
                    bgColorLight: 'bg-yellow-100', 
                    bgColorDark: 'bg-yellow-800' 
                }
            ];
        }
    };

    const getRecentActivity = (): string[] => {
        // Usar la actividad real del backend si está disponible
        if (activity && activity.length > 0) {
            return activity.map(item => item.text || 'Actividad reciente');
        }

        // Fallback con mensajes por rol
        const userRole = user?.role_name || 'niño';
        
        if (userRole === 'administrador') {
            return [
                'Sistema inicializado',
                'Esperando actividad...',
                'Dashboard cargado',
                'Sin actividad reciente'
            ];
        } else if (userRole === 'tutor') {
            return [
                'Panel de tutor cargado',
                'Esperando interacciones...',
                'Sistema listo',
                'Sin actividad reciente'
            ];
        } else {
            // Para niños - más encouraging
            return [
                `¡Hola ${user?.name || 'pequeño'}! ¿Listo para practicar?`,
                'Explora tus mensajes favoritos',
                'Prueba a reproducir diferentes sonidos',
                '¡Sigue practicando para mejorar!'
            ];
        }
    };

    const getUserTitle = (): string => {
        const userName = user?.name || 'Usuario';
        
        return `¡Hola ${userName}!`;
    };

    const renderStatItem = ({ item }: { item: StatItem }) => (
        <View
            className={`rounded-xl p-4 shadow  ${isDark ? item.bgColorDark : item.bgColorLight}`}
            style={{ minWidth: 370, maxWidth: 400 }}
        >
            <Text
                className={`${isDark ? 'text-white text-center' : 'text-black text-center'} text-lg font-bold`}
                style={item.isItalic ? { fontStyle: 'italic', ...item.textStyle } : item.textStyle}
            >
                {item.value}
            </Text>
            <Text className={`${isDark ? 'text-gray-300 text-center' : 'text-gray-600 text-center'} mt-1`}>
                {item.title}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View className={` justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
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
                    Bienvenido al Inicio
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

                {/* Botón Monitor ESP32 - Solo para tutores y administradores */}
                {(user?.role_name === 'tutor' || user?.role_name === 'administrador') && (
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
                                    Monitor del Control
                                </Text>
                                <Text className="text-blue-100 text-sm mb-2">
                                    Ver eventos en tiempo real del dispositivo
                                </Text>
                                <View className="flex-row items-center">
                                    <View className={`w-3 h-3 rounded-full mr-2 ${status.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                                    <Text className={`text-xs ${status.connected ? 'text-green-200' : 'text-red-200'}`}>
                                        {status.connected ? 'Conectado' : 'Desconectado'}
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
                )}

            {(user?.role_name === 'administrador' || user?.role_name === 'tutor') && (
                    <TouchableOpacity
                        className={`rounded-2xl p-6 mb-6 shadow-lg ${isDark ? 'bg-purple-800' : 'bg-purple-600'}`}
                        onPress={() => {
                            console.log('🔧 Navegando a Configuración...');
                            navigation.navigate('Settings');
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
                                <Text className="text-4xl">⚙️</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-xl font-bold mb-1">
                                    Configuración
                                </Text>
                                <Text className="text-purple-100 text-sm mb-2">
                                    Gestionar configuraciones del sistema
                                </Text>
                                <Text className="text-purple-200 text-xs">
                                    Perfil • Salir del sistema • Preferencias
                                </Text>
                            </View>
                            <View className="ml-4">
                                <Text className="text-white text-2xl">➤</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Botón acceso directo a Mis Mensajes para niños */}
                {user?.role_name === 'niño' && (
                    <TouchableOpacity
                        className={`rounded-2xl p-6 mb-6 shadow-lg ${isDark ? 'bg-green-800' : 'bg-green-600'}`}
                        onPress={() => {
                            console.log('🔍 Navegando a Mis Mensajes...');
                            navigation.navigate('MyMessages');
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
                                <Text className="text-4xl">💬</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-xl font-bold mb-1">
                                    Mis Mensajes
                                </Text>
                                <Text className="text-green-100 text-sm mb-2">
                                    Ver y reproducir tus mensajes asignados
                                </Text>
                                <Text className="text-green-200 text-xs">
                                    {stats.totalMessages || 0} mensajes disponibles | {stats.favoriteMessages || 0} favoritos
                                </Text>
                            </View>
                            <View className="ml-4">
                                <Text className="text-white text-2xl">➤</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* <View
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
                </View> */}
            </ScrollView>

            <BottomNavBar theme={theme} />
        </View>
    );
};

export default DashboardScreen;
