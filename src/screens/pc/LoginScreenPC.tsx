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
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import type { RootStackParamList } from '../../navigation/AppNavigator';

const LoginScreenPC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { deviceType, screenWidth } = useDeviceType();
    
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
        clearError();
        
        // Validar campos
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        
        if (emailValidation || passwordValidation) {
            setEmailError(emailValidation);
            setPasswordError(passwordValidation);
            return;
        }

        setEmailError('');
        setPasswordError('');

        try {
            await login({ email, password });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al iniciar sesión');
        }
    };

    // Redireccionar si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigation.navigate('Dashboard');
        }
    }, [isAuthenticated, navigation]);

    // Mostrar loading
    if (isLoading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
                    Iniciando sesión...
                </Text>
            </View>
        );
    }

    // Layout para PC - Dos columnas
    const containerWidth = Math.min(screenWidth * 0.9, 1200);
    const leftPanelWidth = containerWidth * 0.6;
    const rightPanelWidth = containerWidth * 0.4;

    return (
        <ScrollView 
            className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
            }}
        >
            <View 
                style={{ width: containerWidth, maxWidth: 1200 }}
                className={`flex-row rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
                {/* Panel Izquierdo - Información/Branding */}
                <View 
                    style={{ width: leftPanelWidth }}
                    className="bg-gradient-to-br from-blue-600 to-purple-700 p-12 justify-center items-center"
                >
                    <View className="items-center">
                        <View className="w-32 h-32 bg-white/20 rounded-full justify-center items-center mb-8">
                            <Text className="text-white text-4xl font-bold">TC</Text>
                        </View>
                        <Text className="text-white text-4xl font-bold mb-4 text-center">
                            Talking Children
                        </Text>
                        <Text className="text-blue-100 text-xl text-center mb-8">
                            Panel de Administración y Tutores
                        </Text>
                        <Text className="text-blue-200 text-center leading-relaxed">
                            Gestiona mensajes, asigna tutores a niños, y monitorea el progreso 
                            de comunicación de forma eficiente y segura.
                        </Text>
                    </View>
                </View>

                {/* Panel Derecho - Formulario */}
                <View 
                    style={{ width: rightPanelWidth }}
                    className="p-12 justify-center"
                >
                    <View className="mb-8">
                        <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Iniciar Sesión
                        </Text>
                        <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Accede a tu panel de control
                        </Text>
                    </View>

                    {error && (
                        <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
                            <Text className="text-red-700">{error}</Text>
                        </View>
                    )}

                    {/* Email */}
                    <View className="mb-6">
                        <Text className={`mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Correo Electrónico
                        </Text>
                        <TextInput
                            placeholder="admin@talkingchildren.com"
                            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className={`w-full px-4 py-4 text-lg rounded-xl border-2 ${
                                emailError 
                                    ? 'border-red-500 bg-red-50' 
                                    : isDark
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                        : 'bg-gray-50 border-gray-300 text-black focus:border-blue-500'
                            }`}
                        />
                        {emailError ? (
                            <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
                        ) : null}
                    </View>

                    {/* Password */}
                    <View className="mb-8">
                        <Text className={`mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                            className={`w-full px-4 py-4 text-lg rounded-xl border-2 ${
                                passwordError 
                                    ? 'border-red-500 bg-red-50' 
                                    : isDark
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                        : 'bg-gray-50 border-gray-300 text-black focus:border-blue-500'
                            }`}
                        />
                        {passwordError ? (
                            <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>
                        ) : null}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 py-4 rounded-xl mb-6 shadow-lg"
                    >
                        <Text className="text-center text-white font-semibold text-lg">
                            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-gray-300 opacity-50" />
                        <Text className={`mx-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            O continúa con
                        </Text>
                        <View className="flex-1 h-px bg-gray-300 opacity-50" />
                    </View>

                    {/* Register Link */}
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Register')} 
                        className="mt-8"
                    >
                        <Text className="text-center text-blue-600 dark:text-blue-400 font-semibold">
                            ¿No tienes cuenta? Regístrate aquí
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default LoginScreenPC;
