import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { useDeviceType } from '../hooks/useDeviceType';

// Pantallas originales (mobile)
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from '../screens/Dashboard';
import ButtonConfigScreen from '../screens/ButtonConfig';
import ButtonConfigDetailScreen from '../screens/ButtonConfigDetail';
import NotificationsScreen from '../screens/Notification';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import MyChildrenScreen from '../screens/MyChildrenScreen';
import MyMessagesScreen from '../screens/MyMessagesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import TTSDashboardScreen from '../screens/TTSDashboardScreen';
import ChildrenManagementScreen from '../screens/ChildrenManagementScreen';
import MessageAssignmentScreen from '../screens/MessageAssignmentScreen';
import TutorMessageManagementScreen from '../screens/TutorMessageManagementScreen';
import UsersScreen from '../screens/UsersScreen';
import AudioMessagesScreen from '../screens/AudioMessagesScreen';
import ButtonMessagesScreen from '../screens/ButtonMessagesScreen';
import ESP32AdminControlScreen from '../screens/ESP32AdminControlScreen';
import ESP32MonitorScreen from '../screens/ESP32MonitorScreen';
import ESP32MonitorBridge from '../screens/ESP32MonitorBridge';
import WhatsAppConfigScreen from '../screens/WhatsAppConfigScreen';

// Pantallas PC (admin/tutor)
import LoginScreenPC from '../screens/pc/LoginScreenPC';
import DashboardScreenPC from '../screens/pc/DashboardScreenPC';
import MessageManagementPC from '../screens/pc/MessageManagementPC';

// Pantallas Smartwatch (niños)
import SmartWatchHomeScreen from '../screens/smartwatch/SmartWatchHomeScreen';

// Componente adaptativo
import AdaptiveScreen from '../components/AdaptiveScreen';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  WhatsAppConfig: undefined;
  Dashboard: undefined;
  ConfigDetail: { id: number };
  Button: undefined;
  Notifications: undefined;
  Login: undefined;
  Register: undefined;
  Categories: undefined;
  CategoryMessages: { categoryId: number; categoryName: string };
  CreateCategory: undefined;
  EditCategory: { categoryId: number };
  Messages: undefined;
  CreateMessage: undefined;
  EditMessage: { messageId: number };
  MessageDetail: { messageId: number };
  MyChildren: undefined;
  MyMessages: undefined;
  FavoriteMessages: undefined;
  ChildMessagesView: { childId: number; childName: string };
  AssignMessages: { childId: number; childName: string };
  ESP32Control: undefined;
  ESP32Monitor: undefined;
  ESP32MonitorBridge: undefined;
  AudioMessages: undefined;
  ButtonMessages: undefined;
  TTSSettings: undefined;
  Statistics: undefined;
  Users: undefined;
  TTSDashboard: undefined;
  ChildrenManagement: undefined;
  MessageAssignment: undefined;
  TutorMessageManagement: undefined;
  MessageManagement: undefined;
  SmartWatchHome: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AdaptiveAppNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { deviceType, isSmartwatch, isDesktop } = useDeviceType();

  // Función para determinar la pantalla inicial según el dispositivo y usuario
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Login';

    if (isSmartwatch) {
      return 'SmartWatchHome';
    }

    if (isDesktop && (user?.role_name === 'administrador' || user?.role_name === 'tutor')) {
      return 'Dashboard';
    }

    return 'Dashboard';
  };

  // Función para determinar qué componente usar para cada pantalla
  const getScreenComponent = (screenName: string) => {
    switch (screenName) {
      case 'Login':
        return isDesktop ? LoginScreenPC : LoginScreen;

      case 'Dashboard':
        if (isSmartwatch) {
          return SmartWatchHomeScreen;
        } else if (isDesktop && (user?.role_name === 'administrador' || user?.role_name === 'tutor')) {
          return DashboardScreenPC;
        }
        return DashboardScreen;

      case 'SmartWatchHome':
        return SmartWatchHomeScreen;

      case 'MessageManagement':
        return isDesktop ? MessageManagementPC : MessagesScreen;

      default:
        return null;
    }
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Pantallas no autenticadas
        <>
          <Stack.Screen name="Login" component={getScreenComponent('Login') || LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Pantallas autenticadas - adaptadas por dispositivo
        <>
          {isSmartwatch ? (
            // Navegación para smartwatch (niños)
            <Stack.Screen name="SmartWatchHome" component={SmartWatchHomeScreen} />
          ) : isDesktop && (user?.role_name === 'administrador' || user?.role_name === 'tutor') ? (
            // Navegación para PC (admin/tutor)
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreenPC} />
              <Stack.Screen name="MessageManagement" component={MessageManagementPC} />
              <Stack.Screen name="ChildrenManagement" component={ChildrenManagementScreen} />
              <Stack.Screen name="MessageAssignment" component={MessageAssignmentScreen} />
              <Stack.Screen name="TutorMessageManagement" component={TutorMessageManagementScreen} />
              <Stack.Screen name="Users" component={UsersScreen} />
              <Stack.Screen name="ESP32Control" component={ESP32AdminControlScreen} />
              <Stack.Screen name="ESP32Monitor" component={ESP32MonitorScreen} />
              <Stack.Screen name="ESP32MonitorBridge" component={ESP32MonitorBridge} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="WhatsAppConfig" component={WhatsAppConfigScreen} />
            </>
          ) : (
            // Navegación móvil estándar
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Button" component={ButtonConfigScreen} />
              <Stack.Screen name="ConfigDetail" component={ButtonConfigDetailScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Categories" component={CategoriesScreen} />
              <Stack.Screen name="Messages" component={MessagesScreen} />
              <Stack.Screen name="MyChildren" component={MyChildrenScreen} />
              <Stack.Screen name="MyMessages" component={MyMessagesScreen} />
              <Stack.Screen name="TTSDashboard" component={TTSDashboardScreen} />
              <Stack.Screen name="ChildrenManagement" component={ChildrenManagementScreen} />
              <Stack.Screen name="MessageAssignment" component={MessageAssignmentScreen} />
              <Stack.Screen name="TutorMessageManagement" component={TutorMessageManagementScreen} />
              <Stack.Screen name="Users" component={UsersScreen} />
              <Stack.Screen name="ESP32Control" component={ESP32AdminControlScreen} />
              <Stack.Screen name="ESP32Monitor" component={ESP32MonitorScreen} />
              <Stack.Screen name="ESP32MonitorBridge" component={ESP32MonitorBridge} />
              <Stack.Screen name="AudioMessages" component={AudioMessagesScreen} />
              <Stack.Screen name="ButtonMessages" component={ButtonMessagesScreen} />
              <Stack.Screen name="WhatsAppConfig" component={WhatsAppConfigScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default AdaptiveAppNavigator;
