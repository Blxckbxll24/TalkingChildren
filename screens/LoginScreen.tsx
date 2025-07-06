import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import Svg, { Path } from 'react-native-svg';
import type { RootStackParamList } from '../navigation/AppNavigator';

const LoginScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        Alert.alert('Login', `Ingresando con: ${email}`);
        navigation.navigate('Home');
    };

    const handleFacebookLogin = () => {
        Alert.alert('Facebook Login', 'Iniciar sesión con Facebook');
    };

    const handleGoogleLogin = () => {
        Alert.alert('Google Login', 'Iniciar sesión con Google');
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                backgroundColor: isDark ? '#111827' : '#fff',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <View className="mb-6">
                <Text className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-black'}`}>
                    Inicia Sesión con tu cuenta
                </Text>
                <Text className={`text-sm text-center mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Ingresa tu correo y contraseña para poder iniciar
                </Text>
            </View>

            <View className="mb-4">
                <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Correo electrónico
                </Text>
                <TextInput
                    placeholder="tucorreo@ejemplo.com"
                    placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`w-full px-4 py-3 rounded-xl border ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-black'
                        }`}
                />
            </View>

            <View className="mb-6">
                <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contraseña
                </Text>
                <TextInput
                    placeholder="Tu contraseña"
                    placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className={`w-full px-4 py-3 rounded-xl border ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-black'
                        }`}
                />
            </View>

            <TouchableOpacity
                onPress={handleSubmit}
                className="bg-blue-600 py-3 rounded-xl mb-6"
            >
                <Text className="text-center text-white font-semibold">Entrar</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-400 opacity-50" />
                <Text className={`mx-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>O</Text>
                <View className="flex-1 h-px bg-gray-400 opacity-50" />
            </View>

            {/* Facebook Login */}
            <TouchableOpacity
                onPress={handleFacebookLogin}
                className="flex-row items-center justify-center border border-blue-600 rounded-xl py-3 mb-4"
            >
                <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                    <Path
                        fill={isDark ? '#3B82F6' : '#2563eb'}
                        d="M22.675 0h-21.35C.592 0 0 .59 0 1.318v21.364C0 23.412.592 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.918.001c-1.504 0-1.794.716-1.794 1.765v2.314h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.324-.588 1.324-1.318V1.318C24 .59 23.408 0 22.675 0z"
                    />
                </Svg>
                <Text className={`ml-3 font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Iniciar sesión con Facebook
                </Text>
            </TouchableOpacity>

            {/* Google Login */}
            <TouchableOpacity
                onPress={handleGoogleLogin}
                className="flex-row items-center justify-center border border-gray-400 rounded-xl py-3 dark:text-gray-200 dark:border-gray-600"
            >
                <Svg width={20} height={20} viewBox="0 0 533.5 544.3" fill="none">
                    <Path fill="#4285F4" d="M533.5 278.4c0-18.5-1.6-36.2-4.6-53.4H272v101h147.1c-6.3 34-25.5 62.7-54.2 82v68h87.4c51-47 80.2-116 80.2-197.6z" />
                    <Path fill="#34A853" d="M272 544.3c73.4 0 135-24.3 180-65.9l-87.7-68c-24.4 16.4-55.8 26-92.3 26-70.9 0-131-47.9-152.5-112.2H32.4v70.5c45.2 89 137.9 149.6 239.6 149.6z" />
                    <Path fill="#FBBC04" d="M119.7 323.9c-10.4-30.4-10.4-63.2 0-93.6V159.8H32.4c-45.1 89-45.1 195.3 0 284.3l87.3-69.4z" />
                    <Path fill="#EA4335" d="M272 107.7c39.9 0 75.8 13.7 104 40.6l78-78c-47-44-108-70.9-182-70.9-101.7 0-194.4 60.6-239.6 149.6l87.3 69.4c21.5-64.3 81.6-112.7 152.3-112.7z" />
                </Svg>
                <Text className={`ml-3 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Iniciar sesión con Google
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-6">
                <Text className="mt-6 text-center text-blue-600 dark:text-blue-400 font-semibold">
                    ¿No tienes cuenta? Regístrate aquí
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default LoginScreen;
