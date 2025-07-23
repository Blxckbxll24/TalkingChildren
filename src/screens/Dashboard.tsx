import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';

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
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    
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
