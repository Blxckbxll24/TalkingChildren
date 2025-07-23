import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import Svg, { Path } from 'react-native-svg';
import type { RootStackParamList } from '../navigation/AppNavigator';

const LoginScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    // Zustand store
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Validaciones
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'El correo es requerido';
        }
        if (!emailRegex.test(email)) {
            return 'Formato de correo inválido';
        }
        return '';
    };

    const validatePassword = (password: string) => {
        if (!password) {
            return 'La contraseña es requerida';
        }
        if (password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }
        return '';
    };

    const handleSubmit = async () => {
        // Limpiar errores previos
        clearError();
        setEmailError('');
        setPasswordError('');

        // Validar campos
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        if (emailValidation) {
            setEmailError(emailValidation);
            return;
        }

        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }

        // Intentar login
        const success = await login({ email, password });
        
        if (success) {
            navigation.navigate('Dashboard');
        }
    };

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigation.navigate('Dashboard');
        }
    }, [isAuthenticated, navigation]);

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
                    onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    className={`w-full px-4 py-3 rounded-xl border ${
                        emailError 
                            ? 'border-red-500' 
                            : isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                />
                {emailError ? (
                    <Text className="text-red-500 text-xs mt-1">{emailError}</Text>
                ) : null}
            </View>

            <View className="mb-6">
                <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contraseña
                </Text>
                <TextInput
                    placeholder="Tu contraseña"
                    placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry
                    editable={!isLoading}
                    className={`w-full px-4 py-3 rounded-xl border ${
                        passwordError 
                            ? 'border-red-500' 
                            : isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                />
                {passwordError ? (
                    <Text className="text-red-500 text-xs mt-1">{passwordError}</Text>
                ) : null}
            </View>

            {error ? (
                <View className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Text className="text-red-600 dark:text-red-300 text-sm text-center">
                        {error}
                    </Text>
                </View>
            ) : null}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`py-3 rounded-xl mb-6 ${
                    isLoading ? 'bg-gray-400' : 'bg-blue-600'
                }`}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-center text-white font-semibold">Entrar</Text>
                )}
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
