import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StatCard {
    id: string;
    title: string;
    value: string | number;
    icon: string;
    color: string;
    change?: string;
    trend?: 'up' | 'down' | 'stable';
}

interface ActivityItem {
    id: string;
    type: 'message' | 'user' | 'session' | 'assignment';
    title: string;
    description: string;
    time: string;
    user?: string;
}

const DashboardScreenPC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { user } = useAuthStore();
    const { screenWidth } = useDeviceType();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    // Datos simulados - aquí conectarías con la API real
    const getStatsData = (): StatCard[] => {
        const userRole = user?.role_name || 'administrador';
        
        if (userRole === 'administrador') {
            return [
                { id: '1', title: 'Total Usuarios', value: 156, icon: 'users', color: 'blue', change: '+12%', trend: 'up' },
                { id: '2', title: 'Mensajes Activos', value: 2847, icon: 'messages', color: 'green', change: '+8%', trend: 'up' },
                { id: '3', title: 'Sesiones Hoy', value: 89, icon: 'activity', color: 'purple', change: '+15%', trend: 'up' },
                { id: '4', title: 'Tutores Activos', value: 24, icon: 'userplus', color: 'orange', change: '+2%', trend: 'up' },
                { id: '5', title: 'Niños Registrados', value: 132, icon: 'target', color: 'indigo', change: '+5%', trend: 'up' },
                { id: '6', title: 'Tiempo Promedio', value: '12m', icon: 'clock', color: 'pink', change: '-3%', trend: 'down' },
            ];
        } else if (userRole === 'tutor') {
            return [
                { id: '1', title: 'Mis Niños', value: 8, icon: 'users', color: 'blue', change: '+1', trend: 'up' },
                { id: '2', title: 'Mensajes Creados', value: 45, icon: 'messages', color: 'green', change: '+5', trend: 'up' },
                { id: '3', title: 'Sesiones Esta Semana', value: 28, icon: 'activity', color: 'purple', change: '+12%', trend: 'up' },
                { id: '4', title: 'Categorías Activas', value: 12, icon: 'target', color: 'orange', change: '+2', trend: 'up' },
                { id: '5', title: 'Progreso Promedio', value: '78%', icon: 'chart', color: 'indigo', change: '+5%', trend: 'up' },
                { id: '6', title: 'Tiempo por Sesión', value: '8m', icon: 'clock', color: 'pink', change: '-1m', trend: 'down' },
            ];
        }
        return [];
    };

    const getRecentActivity = (): ActivityItem[] => {
        const userRole = user?.role_name || 'administrador';
        
        if (userRole === 'administrador') {
            return [
                { id: '1', type: 'user', title: 'Nuevo tutor registrado', description: 'María González se unió al sistema', time: '2h', user: 'María González' },
                { id: '2', type: 'message', title: 'Mensaje popular', description: '"Hola mamá" usado 45 veces hoy', time: '3h' },
                { id: '3', type: 'session', title: 'Sesión completada', description: 'Ana completó 15 ejercicios', time: '4h', user: 'Ana Martínez' },
                { id: '4', type: 'assignment', title: 'Nueva asignación', description: 'Tutor Juan asignó 3 nuevos mensajes', time: '5h', user: 'Juan López' },
                { id: '5', type: 'user', title: 'Progreso destacado', description: 'Carlos mejoró 25% esta semana', time: '6h', user: 'Carlos Ruiz' },
            ];
        } else if (userRole === 'tutor') {
            return [
                { id: '1', type: 'message', title: 'Mensaje asignado', description: 'Asignaste "Buenas noches" a Ana', time: '1h', user: 'Ana' },
                { id: '2', type: 'session', title: 'Sesión exitosa', description: 'Carlos practicó 8 frases nuevas', time: '2h', user: 'Carlos' },
                { id: '3', type: 'assignment', title: 'Nueva categoría', description: 'Creaste categoría "Emociones"', time: '3h' },
                { id: '4', type: 'user', title: 'Progreso notable', description: 'Luis mejoró pronunciación', time: '4h', user: 'Luis' },
                { id: '5', type: 'message', title: 'Mensaje popular', description: '"Tengo hambre" usado 12 veces', time: '5h' },
            ];
        }
        return [];
    };

    const getIconComponent = (iconType: string, color: string, size: number = 24) => {
        return (
            <Text style={{ fontSize: size, color: isDark ? '#fff' : color }}>
                {iconType === 'users' ? '👥' :
                 iconType === 'messages' ? '💬' :
                 iconType === 'activity' ? '📊' :
                 iconType === 'userplus' ? '➕' :
                 iconType === 'target' ? '🎯' :
                 iconType === 'clock' ? '⏰' :
                 iconType === 'chart' ? '📈' : '📊'}
            </Text>
        );
    };

    const getActivityIcon = (type: string) => {
        return (
            <Text style={{ fontSize: 20, color: isDark ? '#60a5fa' : '#3b82f6' }}>
                {type === 'user' ? '👤' :
                 type === 'message' ? '💬' :
                 type === 'session' ? '📊' :
                 type === 'assignment' ? '🎯' : '🔔'}
            </Text>
        );
    };

    const getUserTitle = (): string => {
        const userRole = user?.role_name || 'administrador';
        const userName = user?.name || 'Usuario';
        
        if (userRole === 'administrador') return 'Panel de Administración';
        if (userRole === 'tutor') return `Panel de Tutor - ${userName}`;
        return `Dashboard`;
    };

    // Layout responsivo
    const isLargeScreen = screenWidth >= 1200;
    const isMediumScreen = screenWidth >= 768;
    const gridColumns = isLargeScreen ? 3 : isMediumScreen ? 2 : 1;
    const cardWidth = (screenWidth - 80) / gridColumns - 20;

    const renderStatCard = ({ item }: { item: StatCard }) => (
        <View
            style={{ width: cardWidth }}
            className={`rounded-2xl p-6 shadow-lg m-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
            <View className="flex-row items-center justify-between mb-4">
                <View className={`p-3 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900`}>
                    {getIconComponent(item.icon, `#${item.color}`, 28)}
                </View>
                {item.trend && (
                    <View className={`px-2 py-1 rounded-full bg-${item.trend === 'up' ? 'green' : 'red'}-100`}>
                        <Text className={`text-xs font-medium text-${item.trend === 'up' ? 'green' : 'red'}-800`}>
                            {item.change}
                        </Text>
                    </View>
                )}
            </View>
            <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.value}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.title}
            </Text>
        </View>
    );

    const renderActivityItem = ({ item }: { item: ActivityItem }) => (
        <View className={`flex-row items-start p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className={`p-2 rounded-lg mr-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {getActivityIcon(item.type)}
            </View>
            <View className="flex-1">
                <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                </Text>
                <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                </Text>
                <View className="flex-row items-center">
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Hace {item.time}
                    </Text>
                    {item.user && (
                        <>
                            <Text className={`text-xs mx-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>•</Text>
                            <Text className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                {item.user}
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    Cargando dashboard...
                </Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: insets.top }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between p-6">
                    <View>
                        <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Dashboard
                        </Text>
                        <Text className={`text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getUserTitle()}
                        </Text>
                    </View>
                    <View className="flex-row space-x-4">
                        <TouchableOpacity 
                            className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
                        >
                            <Text style={{ fontSize: 24, color: isDark ? '#fff' : '#374151' }}>🔔</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
                        >
                            <Text style={{ fontSize: 24, color: isDark ? '#fff' : '#374151' }}>⚙️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="px-6 mb-8">
                    <FlatList
                        data={getStatsData()}
                        renderItem={renderStatCard}
                        keyExtractor={(item) => item.id}
                        numColumns={gridColumns}
                        scrollEnabled={false}
                        columnWrapperStyle={gridColumns > 1 ? { justifyContent: 'space-between' } : undefined}
                    />
                </View>

                {/* Activity Section */}
                <View className="px-6 mb-8">
                    <View className={`rounded-2xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <View className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <View className="flex-row items-center justify-between">
                                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Actividad Reciente
                                </Text>
                                <TouchableOpacity className="flex-row items-center">
                                    <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        Ver todo
                                    </Text>
                                    <Text style={{ fontSize: 16, color: isDark ? '#60a5fa' : '#2563eb', marginLeft: 8 }}>📈</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <FlatList
                            data={getRecentActivity()}
                            renderItem={renderActivityItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    </View>
                </View>

                {/* Spacer for bottom navigation if needed */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

export default DashboardScreenPC;
