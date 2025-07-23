import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons, Entypo, Feather } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

interface NavItem {
    name: string;
    icon: React.ReactNode;
    to: keyof RootStackParamList;
    roles: string[]; // Roles que pueden ver este item
}

// Navegación para administradores
const adminNavItems: NavItem[] = [
    { name: 'Panel', icon: <MaterialIcons name="dashboard" size={24} />, to: 'Dashboard', roles: ['administrador'] },
    { name: 'TTS', icon: <MaterialIcons name="play-circle-filled" size={24} />, to: 'TTSDashboard', roles: ['administrador'] },
    { name: 'Mensajes', icon: <MaterialIcons name="message" size={24} />, to: 'Messages', roles: ['administrador'] },
    { name: 'Config', icon: <Feather name="settings" size={24} />, to: 'Settings', roles: ['administrador'] },
    { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile', roles: ['administrador'] },
];

// Navegación para tutores
const tutorNavItems: NavItem[] = [
    { name: 'Panel', icon: <MaterialIcons name="dashboard" size={24} />, to: 'Dashboard', roles: ['tutor'] },
    { name: 'TTS', icon: <MaterialIcons name="play-circle-filled" size={24} />, to: 'TTSDashboard', roles: ['tutor'] },
    { name: 'Mensajes', icon: <MaterialIcons name="message" size={24} />, to: 'Messages', roles: ['tutor'] },
    { name: 'Niños', icon: <MaterialIcons name="child-care" size={24} />, to: 'ChildrenManagement', roles: ['tutor'] },
    { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile', roles: ['tutor'] },
];

// Navegación para niños
const childNavItems: NavItem[] = [
    { name: 'Inicio', icon: <MaterialIcons name="home" size={24} />, to: 'Home', roles: ['niño'] },
    { name: 'TTS', icon: <MaterialIcons name="play-circle-filled" size={24} />, to: 'TTSDashboard', roles: ['niño'] },
    { name: 'Favoritos', icon: <MaterialIcons name="favorite" size={24} />, to: 'MyMessages', roles: ['niño'] },
    { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile', roles: ['niño'] },
];

interface BottomNavBarProps {
    theme: 'light' | 'dark';
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ theme }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const isDark = theme === 'dark';
    const { user } = useAuthStore();

    // Obtener los elementos de navegación según el rol del usuario
    const getNavItems = (): NavItem[] => {
        const userRole = user?.role_name?.toLowerCase();
        
        switch (userRole) {
            case 'administrador':
                return adminNavItems;
            case 'tutor':
                return tutorNavItems;
            case 'niño':
                return childNavItems;
            default:
                // Si no hay rol o es desconocido, mostrar navegación básica
                return [
                    { name: 'Inicio', icon: <MaterialIcons name="home" size={24} />, to: 'Home', roles: ['guest'] },
                    { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile', roles: ['guest'] },
                ];
        }
    };

    const navItems = getNavItems();

    return (
        <View
            className={`flex-row justify-between px-6 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                }`}
            style={{ paddingBottom: insets.bottom, paddingTop: 12, elevation: 10 }}
        >
            {navItems.map(({ name, icon, to }) => {
                const isActive = route.name === to;
                return (
                    <TouchableOpacity
                        key={name}
                        onPress={() => navigation.navigate({ name: to as any, params: undefined })}
                        className="items-center"
                    >
                        {React.cloneElement(icon as React.ReactElement<{ color: string }>, {
                            color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : isDark ? '#9ca3af' : '#6b7280',
                        })}

                        <Text
                            className="text-xs mt-1"
                            style={{ color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : isDark ? '#9ca3af' : '#6b7280' }}
                        >
                            {name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default BottomNavBar;
