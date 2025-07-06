import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from 'screens/Dashboard';
import ButtonConfigScreen from 'screens/ButtonConfig';
import ButtonConfigDetailScreen from 'screens/ButtonConfigDetail';
import NotificationsScreen from 'screens/Notification';
import LoginScreen from 'screens/LoginScreen';
import RegisterScreen from 'screens/RegisterScreen';

export type RootStackParamList = {
    Home: undefined;
    Profile: undefined;
    Settings: undefined;
    Dashboard: undefined;
    ConfigDetail: { id: number };
    Button: undefined;
    Notifications : undefined;
    Login: undefined;
    Register : undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Button" component={ButtonConfigScreen} />
        <Stack.Screen name="ConfigDetail" component={ButtonConfigDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

export default AppNavigator;
