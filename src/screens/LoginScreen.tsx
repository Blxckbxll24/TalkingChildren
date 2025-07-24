import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
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
        backgroundColor: isDark ? '#0f172a' : '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: isDark ? '#1e293b' : '#fff',
          borderRadius: 24,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 64, height: 64, marginBottom: 8, borderRadius: 16 }}
            resizeMode="contain"
          />
          <Text
            className={`text-center text-3xl font-extrabold ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Bienvenido
          </Text>
          <Text
            className={`mt-2 text-center text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Inicia sesión para continuar
          </Text>
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text
            className={`mb-1 text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Correo electrónico
          </Text>
          <TextInput
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            style={{
              borderWidth: 1.5,
              borderColor: emailError ? '#ef4444' : isDark ? '#334155' : '#cbd5e1',
              backgroundColor: isDark ? '#334155' : '#f1f5f9',
              color: isDark ? '#fff' : '#0f172a',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
            }}
            selectionColor={isDark ? '#38bdf8' : '#2563eb'}
          />
          {emailError ? <Text className="mt-1 text-xs text-red-500">{emailError}</Text> : null}
        </View>

        {/* Password */}
        <View className="mb-2">
          <Text
            className={`mb-1 text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Contraseña
          </Text>
          <TextInput
            placeholder="Tu contraseña"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            secureTextEntry
            editable={!isLoading}
            style={{
              borderWidth: 1.5,
              borderColor: passwordError ? '#ef4444' : isDark ? '#334155' : '#cbd5e1',
              backgroundColor: isDark ? '#334155' : '#f1f5f9',
              color: isDark ? '#fff' : '#0f172a',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
            }}
            selectionColor={isDark ? '#38bdf8' : '#2563eb'}
          />
          {passwordError ? (
            <Text className="mt-1 text-xs text-red-500">{passwordError}</Text>
          ) : null}
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => {
            /* Aquí puedes navegar a la pantalla de recuperación */
          }}
          disabled={isLoading}
          style={{ alignSelf: 'flex-end', marginBottom: 18 }}>
          <Text className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        {/* Error global */}
        {error ? (
          <View
            style={{
              backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
              borderRadius: 10,
              padding: 10,
              marginBottom: 14,
            }}>
            <Text className={`text-center text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Botón login */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? (isDark ? '#334155' : '#cbd5e1') : '#2563eb',
            borderRadius: 14,
            paddingVertical: 14,
            marginBottom: 10,
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 4,
          }}
          activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color={isDark ? '#fff' : '#fff'} />
          ) : (
            <Text className="text-center text-lg font-bold tracking-wide text-white">Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Registro */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
          <Text
            className={`mt-2 text-center font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            ¿No tienes cuenta?{' '}
            <Text style={{ textDecorationLine: 'underline' }}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
