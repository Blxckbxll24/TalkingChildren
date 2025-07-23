import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore, ROLES } from '../stores/authStore';
import type { RootStackParamList } from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const RegisterScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Zustand store
  const { register, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(ROLES.CHILD);
  
  // Estados de validación
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validaciones
  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'El nombre es requerido';
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  };

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

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      return 'Confirma tu contraseña';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  };

  const handleSubmit = async () => {
    // Limpiar errores previos
    clearError();
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validar campos
    const nameValidation = validateName(fullName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

    if (nameValidation) {
      setNameError(nameValidation);
      return;
    }

    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (confirmPasswordValidation) {
      setConfirmPasswordError(confirmPasswordValidation);
      return;
    }

    // Intentar registro
    const success = await register({
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role_id: roleId,
    });
    
    if (success) {
      navigation.navigate('Login');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthdate;
    setShowDatePicker(Platform.OS === 'ios'); 
    setBirthdate(currentDate);
  };

  const showPicker = () => {
    setShowDatePicker(true);
  };

  const handleInputFocus = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'YYYY-MM-DD';
    return date.toISOString().split('T')[0]; 
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      className={isDark ? 'bg-gray-900' : 'bg-white'}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-6">
        <Text className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-black'}`}>
          Registro
        </Text>
        <Text className={`text-sm text-center mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          ¡Crea una cuenta a continuación!
        </Text>
      </View>

      {/* Nombre completo */}
      <View className="mb-4">
        <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Nombre completo
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          onFocus={handleInputFocus}
          placeholder="Tu nombre completo"
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
        />
      </View>

      {/* Correo */}
      <View className="mb-4">
        <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Correo electrónico
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          onFocus={handleInputFocus}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="tucorreo@ejemplo.com"
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
        />
      </View>

      {/* Fecha de nacimiento */}
      <View className="mb-4">
        <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Fecha de nacimiento
        </Text>
        <TouchableOpacity onPress={showPicker}>
          <View
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
            pointerEvents="none"
          >
            <Text
              className={`text-base ${isDark ? 'text-white' : 'text-black'} ${!birthdate ? (isDark ? 'text-gray-400' : 'text-gray-500') : ''}`}
            >
              {formatDate(birthdate)}
            </Text>
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthdate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            style={isDark ? { backgroundColor: '#fff' , borderRadius: 14, margin: 8, padding: 8} : { backgroundColor: '#f3f4f6' , borderRadius: 14, margin: 8, padding: 8 }}
          />
        )}
      </View>

      {/* Teléfono */}
      <View className="mb-4">
        <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Número de teléfono
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          onFocus={handleInputFocus}
          keyboardType="phone-pad"
          placeholder="Ej. 55 1234 5678"
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
        />
      </View>

      {/* Contraseña */}
      <View className="mb-4">
        <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Contraseña
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          onFocus={handleInputFocus}
          secureTextEntry
          placeholder="Tu contraseña"
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
        />
      </View>

      {/* Confirmar contraseña */}
      <View className="mb-4">
        <Text className={`mb-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Repetir contraseña
        </Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={handleInputFocus}
          secureTextEntry
          placeholder="Repite tu contraseña"
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
        />
      </View>

      {error ? (
        <Text className="text-red-600 text-center mb-4">{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-blue-600 py-3 rounded-xl"
      >
        <Text className="text-center text-white font-semibold">Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6">
        <Text className="text-blue-600 text-center font-semibold">
          ¿Ya tienes una cuenta? Inicia sesión aquí
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterScreen;