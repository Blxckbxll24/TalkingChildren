import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/TabNavigator';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  to: keyof TabParamList;
  roles: string[]; // Roles que pueden ver este item
}

// Navegación para administradores
const adminNavItems: NavItem[] = [
  {
    name: 'Panel',
    icon: <MaterialIcons name="dashboard" size={24} />,
    to: 'Dashboard',
    roles: ['administrador'],
  },
  {
    name: 'Dashboard',
    icon: <MaterialIcons name="play-circle-filled" size={24} />,
    to: 'TTSDashboard',
    roles: ['administrador'],
  },
  {
    name: 'Mensajes',
    icon: <MaterialIcons name="message" size={24} />,
    to: 'Messages',
    roles: ['administrador'],
  },
  {
    name: 'Usuarios',
    icon: <MaterialIcons name="people" size={24} />,
    to: 'Users',
    roles: ['administrador'],
  },
  {
    name: 'Config',
    icon: <Feather name="settings" size={24} />,
    to: 'Settings',
    roles: ['administrador'],
  },
  {
    name: 'Perfil',
    icon: <Feather name="user" size={24} />,
    to: 'Profile',
    roles: ['administrador'],
  },
];

// Navegación para tutores
const tutorNavItems: NavItem[] = [
  {
    name: 'Panel',
    icon: <MaterialIcons name="dashboard" size={24} />,
    to: 'Dashboard',
    roles: ['tutor'],
  },
  {
    name: 'TTS',
    icon: <MaterialIcons name="play-circle-filled" size={24} />,
    to: 'TTSDashboard',
    roles: ['tutor'],
  },
  {
    name: 'Mensajes',
    icon: <MaterialIcons name="message" size={24} />,
    to: 'Messages',
    roles: ['tutor'],
  },
  {
    name: 'Niños',
    icon: <MaterialIcons name="child-care" size={24} />,
    to: 'ChildrenManagement',
    roles: ['tutor'],
  },
  { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile', roles: ['tutor'] },
];

// Navegación para niños
const childNavItems: NavItem[] = [
  { name: 'Inicio', icon: <MaterialIcons name="home" size={24} />, to: 'Home', roles: ['niño'] },
  {
    name: 'TTS',
    icon: <MaterialIcons name="play-circle-filled" size={24} />,
    to: 'TTSDashboard',
    roles: ['niño'],
  },
  {
    name: 'Favoritos',
    icon: <MaterialIcons name="favorite" size={24} />,
    to: 'MyMessages',
    roles: ['niño'],
  },
  { name: 'Perfil', icon: <Feather name="user" size={24} />, to: 'Profile', roles: ['niño'] },
];

interface BottomNavBarProps {
  theme: 'light' | 'dark';
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ theme }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const route = useRoute();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();

  // Obtener los elementos de navegación según el rol del usuario
  const getNavItems = useCallback((): NavItem[] => {
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
          {
            name: 'Inicio',
            icon: <MaterialIcons name="home" size={24} />,
            to: 'Home',
            roles: ['guest'],
          },
          {
            name: 'Perfil',
            icon: <Feather name="user" size={24} />,
            to: 'Profile',
            roles: ['guest'],
          },
        ];
    }
  }, [user?.role_name]);

  const navItems = useMemo(() => getNavItems(), [getNavItems]);

  const handleNavigation = useCallback(
    (screenName: keyof TabParamList) => {
      if (route.name !== screenName) {
        navigation.navigate(screenName);
      }
    },
    [navigation, route.name]
  );

  return (
    <View
      className={`${isDark ? 'bg-gray-900' : 'bg-white'}`}
      style={{
        paddingBottom: insets.bottom,
        paddingTop: 0,
        paddingHorizontal: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: isDark ? 'white' : '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.4,
        shadowRadius: 8,
        elevation: 5,
        borderTopWidth: isDark ? 0.2 : 0,
        borderTopColor: isDark ? '#374151' : 'transparent',
      }}>
      <View className="flex-row items-end justify-around">
        {navItems.map(({ name, icon, to }, index) => {
          const isActive = route.name === to;
          return (
            <View key={name} className="relative items-center">
              <TouchableOpacity
                onPress={() => handleNavigation(to)}
                className="items-center justify-center"
                style={{
                  transform: isActive ? [{ translateY: -10 }] : [{ translateY: 2 }],
                  opacity: isActive ? 1 : 0.6,
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                  zIndex: 2,
                }}>
                <View
                  className="rounded-full"
                  style={{
                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                    padding: 10,
                    shadowColor: isActive ? '#3b82f6' : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isActive ? 0.3 : 0,
                    shadowRadius: isActive ? 8 : 0,
                    elevation: isActive ? 5 : 0,
                  }}>
                  {React.cloneElement(icon as React.ReactElement<{ color: string; size: number }>, {
                    color: isActive ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280',
                    size: 24,
                  })}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavBar;
