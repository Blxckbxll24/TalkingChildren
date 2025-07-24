import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import BottomNavBar from '../components/Navbar';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from '../screens/Dashboard';
import MessagesScreen from '../screens/MessagesScreen';
import TTSDashboardScreen from '../screens/TTSDashboardScreen';
import ChildrenManagementScreen from '../screens/ChildrenManagementScreen';
import MyMessagesScreen from '../screens/MyMessagesScreen';

export type TabParamList = {
  Dashboard: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Messages: undefined;
  TTSDashboard: undefined;
  ChildrenManagement: undefined;
  MyMessages: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const userRole = user?.role_name?.toLowerCase();

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
      {/* Pantallas para administradores */}
      {userRole === 'administrador' && (
        <>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="TTSDashboard" component={TTSDashboardScreen} />
          <Tab.Screen name="Messages" component={MessagesScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}

      {/* Pantallas para tutores */}
      {userRole === 'tutor' && (
        <>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="TTSDashboard" component={TTSDashboardScreen} />
          <Tab.Screen name="Messages" component={MessagesScreen} />
          <Tab.Screen name="ChildrenManagement" component={ChildrenManagementScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}

      {/* Pantallas para niños */}
      {userRole === 'niño' && (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="TTSDashboard" component={TTSDashboardScreen} />
          <Tab.Screen name="MyMessages" component={MyMessagesScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}

      {/* Pantallas por defecto */}
      {!userRole && (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;
