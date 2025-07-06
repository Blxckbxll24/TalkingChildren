import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons, Entypo, Feather } from '@expo/vector-icons';

interface NavItem {
    name: string;
    icon: React.ReactNode;
    to: keyof RootStackParamList;
}

const navItems: NavItem[] = [
    { name: 'Home', icon: <MaterialIcons name="home" size={24} />, to: 'Home' },
    { name: 'Botones', icon: <Entypo name="grid" size={24} />, to: 'Button' },
    { name: 'Estadísticas', icon: <Feather name="bar-chart-2" size={24} />, to: 'Dashboard' },
    { name: 'Notificaciones', icon: <Feather name="bell" size={24} />, to: 'Notifications' },
    { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile' },
];

interface BottomNavBarProps {
    theme: 'light' | 'dark';
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ theme }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const isDark = theme === 'dark';

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
