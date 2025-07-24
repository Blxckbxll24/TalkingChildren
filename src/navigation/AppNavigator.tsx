import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import TabNavigator from './TabNavigator';
import ButtonConfigScreen from '../screens/ButtonConfig';
import ButtonConfigDetailScreen from '../screens/ButtonConfigDetail';
import NotificationsScreen from '../screens/Notification';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import MessageAssignmentScreen from '../screens/MessageAssignmentScreen';

export type RootStackParamList = {
  // Tab screens are handled by TabNavigator
  MainTabs: undefined;
  // Modal and secondary screens
  ConfigDetail: { id: number };
  Button: undefined;
  Notifications: undefined;
  Login: undefined;
  Register: undefined;
  Categories: undefined;
  CategoryMessages: { categoryId: number; categoryName: string };
  CreateCategory: undefined;
  EditCategory: { categoryId: number };
  CreateMessage: undefined;
  EditMessage: { messageId: number };
  MessageDetail: { messageId: number };
  FavoriteMessages: undefined;
  ChildMessagesView: { childId: number; childName: string };
  AssignMessages: { childId: number; childName: string };
  ESP32Control: undefined;
  TTSSettings: undefined;
  Statistics: undefined;
  Users: undefined;
  MessageAssignment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      screenOptions={{
        headerShown: false,
        animation: 'none', // Sin animaciones de transición
      }}>
      {isAuthenticated ? (
        // Pantallas autenticadas
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Button" component={ButtonConfigScreen} />
          <Stack.Screen name="ConfigDetail" component={ButtonConfigDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="MessageAssignment" component={MessageAssignmentScreen} />
        </>
      ) : (
        // Pantallas de autenticación
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
