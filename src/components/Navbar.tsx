import React, { useMemo, useCallback, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AdaptiveAppNavigator';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import Toast from 'react-native-toast-message';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  to: keyof RootStackParamList;
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
    name: 'ESP32',
    icon: <MaterialIcons name="memory" size={24} />,
    to: 'ESP32Control',
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();

  // Debug effect to monitor user changes
  useEffect(() => {
    console.log('🔍 BottomNavBar - User changed:', user);
    console.log('🔍 BottomNavBar - Current route:', route.name);
  }, [user, route.name]);

  // Función para verificar si una pantalla está disponible para el rol actual
  const isScreenAvailable = useCallback(
    (screenName: keyof RootStackParamList): boolean => {
      const userRole = user?.role_name?.toLowerCase();

      // Mapeo de pantallas por rol
      const screensByRole: Record<string, (keyof RootStackParamList)[]> = {
        administrador: ['Dashboard', 'TTSDashboard', 'Messages', 'ESP32Control', 'Users', 'Settings', 'Profile'],
        tutor: ['Dashboard', 'TTSDashboard', 'Messages', 'ChildrenManagement', 'Profile'],
        niño: ['Home', 'TTSDashboard', 'MyMessages', 'Profile'],
        guest: ['Home', 'Profile'],
      };

      const availableScreens = screensByRole[userRole || 'guest'] || screensByRole['guest'];
      return availableScreens.includes(screenName);
    },
    [user?.role_name]
  );

  // Obtener los elementos de navegación según el rol del usuario
  const getNavItems = useCallback((): NavItem[] => {
    const userRole = user?.role_name?.toLowerCase();

    console.log('🔍 Debug Navbar - User role:', userRole);
    console.log('🔍 Debug Navbar - User object:', user);

    switch (userRole) {
      case 'administrador':
        console.log('📋 Mostrando navegación de administrador');
        return adminNavItems;
      case 'tutor':
        console.log('📋 Mostrando navegación de tutor');
        return tutorNavItems;
      case 'niño':
        console.log('📋 Mostrando navegación de niño');
        return childNavItems;
      default:
        console.log('📋 Mostrando navegación por defecto - Rol no reconocido:', userRole);
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
  }, [user]);

  const navItems = useMemo(() => getNavItems(), [getNavItems]);

  const handleNavigation = useCallback(
    (screenName: keyof RootStackParamList) => {
      console.log('🚀 Intentando navegar a:', String(screenName));
      console.log('📍 Pantalla actual:', route.name);
      console.log('👤 Rol de usuario:', user?.role_name?.toLowerCase());

      // Si no hay usuario, no permitir navegación a pantallas protegidas
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        Toast.show({
          type: 'error',
          text1: 'Error de Autenticación',
          text2: 'Debes iniciar sesión para acceder a esta pantalla',
        });
        return;
      }

      // Primera verificación: usar la función de disponibilidad de pantalla
      if (!isScreenAvailable(screenName)) {
        console.error('❌ Pantalla no disponible según mapeo de roles:', String(screenName));
        console.error('👤 Rol actual:', user?.role_name?.toLowerCase());
        Toast.show({
          type: 'error',
          text1: 'Acceso Denegado',
          text2: `La pantalla "${String(screenName)}" no está disponible para tu rol "${user?.role_name}"`,
        });
        return;
      }

      // Segunda verificación: usar los elementos de navegación actuales
      const currentNavItems = getNavItems();
      const targetItem = currentNavItems.find((item) => item.to === screenName);

      if (!targetItem) {
        console.error('❌ Pantalla no encontrada en elementos de navegación:', String(screenName));
        console.error(
          '📋 Pantallas disponibles:',
          currentNavItems.map((item) => item.to)
        );
        Toast.show({
          type: 'error',
          text1: 'Error de Navegación',
          text2: 'Esta pantalla no está disponible en este momento',
        });
        return;
      }

      if (route.name !== screenName) {
        console.log(`✅ Navegando de ${String(route.name)} a ${String(screenName)}`);

        // Verificación adicional: comprobar si la ruta existe en el navigator
        try {
          navigation.navigate(screenName as any);
          console.log('✅ Navegación exitosa a:', String(screenName));
        } catch (error) {
          console.error('❌ Error de navegación:', error);
          Toast.show({
            type: 'error',
            text1: 'Error de Navegación',
            text2: `No se pudo navegar a ${String(screenName)}. Error: ${error}`,
          });
        }
      } else {
        console.log('ℹ️ Ya estás en la pantalla:', String(screenName));
      }
    },
    [navigation, route.name, user, getNavItems, isScreenAvailable]
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
