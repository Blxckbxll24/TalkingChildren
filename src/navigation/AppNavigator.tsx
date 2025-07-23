import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
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

export type RootStackParamList = {
    Home: undefined;
    Profile: undefined;
    Settings: undefined;
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
    TTSSettings: undefined;
    Statistics: undefined;
    Users: undefined;
    TTSDashboard: undefined;
    ChildrenManagement: undefined;
    MessageAssignment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <Stack.Navigator 
            initialRouteName={isAuthenticated ? "Dashboard" : "Login"} 
            screenOptions={{ headerShown: false }}
        >
            {isAuthenticated ? (
                // Pantallas autenticadas
                <>
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Button" component={ButtonConfigScreen} />
                    <Stack.Screen name="ConfigDetail" component={ButtonConfigDetailScreen} />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    <Stack.Screen name="Categories" component={CategoriesScreen} />
                    <Stack.Screen name="Messages" component={MessagesScreen} />
                    <Stack.Screen name="TTSDashboard" component={TTSDashboardScreen} />
                    <Stack.Screen name="MyChildren" component={MyChildrenScreen} />
                    <Stack.Screen name="MyMessages" component={MyMessagesScreen} />
                    <Stack.Screen name="ChildrenManagement" component={ChildrenManagementScreen} />
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
