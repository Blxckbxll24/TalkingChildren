import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import BottomNavBar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from '../screens/Dashboard';
import MessagesScreen from '../screens/MessagesScreen';
import TTSDashboardScreen from '../screens/TTSDashboardScreen';
import ChildrenManagementScreen from '../screens/ChildrenManagementScreen';
import MyMessagesScreen from '../screens/MyMessagesScreen';
import UsersScreen from '../screens/UsersScreen';

export type TabParamList = {
  Dashboard: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Messages: undefined;
  TTSDashboard: undefined;
  ChildrenManagement: undefined;
  MyMessages: undefined;
  Users: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const userRole = user?.role_name?.toLowerCase();

  console.log('🔍 TabNavigator - User:', user);
  console.log('🔍 TabNavigator - User role:', userRole);
  console.log('🔍 TabNavigator - Renderizando pantallas para:', userRole || 'sin rol');

  // Si no hay usuario, mostrar pantallas por defecto
  if (!user) {
    console.log('🔍 TabNavigator - Sin usuario, mostrando pantallas por defecto');
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ocultamos el tab bar por defecto
        lazy: false, // Carga todas las pantallas inmediatamente
        tabBarHideOnKeyboard: true,
      }}
      tabBar={() => <BottomNavBar theme={theme} />}
      initialRouteName={
        userRole === 'administrador' || userRole === 'tutor' ? 'Dashboard' : 'Home'
      }>
      {/* Cargar todas las pantallas para evitar errores de navegación */}
      {/* El control de acceso se maneja en el BottomNavBar y ProtectedRoute */}

      {/* Pantallas comunes */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="TTSDashboard" component={TTSDashboardScreen} />

      {/* Pantallas de administrador y tutor */}
      <Tab.Screen
        name="Dashboard"
        component={() => (
          <ProtectedRoute allowedRoles={['administrador', 'tutor']}>
            <DashboardScreen />
          </ProtectedRoute>
        )}
      />
      <Tab.Screen
        name="Messages"
        component={() => (
          <ProtectedRoute allowedRoles={['administrador', 'tutor']}>
            <MessagesScreen />
          </ProtectedRoute>
        )}
      />

      {/* Pantallas específicas de administrador */}
      <Tab.Screen
        name="Users"
        component={() => (
          <ProtectedRoute allowedRoles={['administrador']}>
            <UsersScreen />
          </ProtectedRoute>
        )}
      />
      <Tab.Screen
        name="Settings"
        component={() => (
          <ProtectedRoute allowedRoles={['administrador']}>
            <SettingsScreen />
          </ProtectedRoute>
        )}
      />

      {/* Pantallas específicas de tutor */}
      <Tab.Screen
        name="ChildrenManagement"
        component={() => (
          <ProtectedRoute allowedRoles={['tutor']}>
            <ChildrenManagementScreen />
          </ProtectedRoute>
        )}
      />

      {/* Pantallas específicas de niños */}
      <Tab.Screen
        name="MyMessages"
        component={() => (
          <ProtectedRoute allowedRoles={['niño']}>
            <MyMessagesScreen />
          </ProtectedRoute>
        )}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
