import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { API_BASE_URL } from '../config/env';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WhatsAppConfigScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  const isDark = theme === 'dark';

  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      // Error silenciado para el usuario
      return null;
    }
  };

  useEffect(() => {
    getWhatsAppStatus();
  }, []);

  const getWhatsAppStatus = async () => {
    const token = await getAuthToken();
    if (!token) return;
    
    setStatusLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setWhatsappStatus(data.data);
      }
    } catch (error) {
      // Error silenciado para el usuario
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    // No formatear automáticamente, permitir al usuario ingresar el número como desee
    setPhone(text);
  };

  const validatePhone = (phoneNumber: string) => {
    // Validación más flexible - permitir cualquier formato con + o sin +
    // Verificar que tenga al menos 10 dígitos
    const numbersOnly = phoneNumber.replace(/[^0-9]/g, '');
    
    // Debe tener al menos 10 dígitos
    if (numbersOnly.length < 10) {
      return false;
    }
    
    // Si empieza con +, debe tener formato internacional
    if (phoneNumber.startsWith('+')) {
      return numbersOnly.length >= 10 && numbersOnly.length <= 15;
    }
    
    // Sin +, debe ser número válido
    return numbersOnly.length >= 10 && numbersOnly.length <= 15;
  };

  const updatePhoneNumber = async () => {
    if (!validatePhone(phone)) {
      Alert.alert(
        'Número inválido',
        'Por favor ingresa un número de teléfono válido.\n\nEjemplos válidos:\n• +529983901955\n• 529983901955\n• 9983901955\n\nEl número debe tener al menos 10 dígitos.'
      );
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Error', 'No tienes autorización para realizar esta acción');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/tutor-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Éxito',
          'Número de WhatsApp actualizado correctamente',
          [{ text: 'OK', onPress: () => getWhatsAppStatus() }]
        );
      } else {
        Alert.alert('Error', data.message || 'Error al actualizar el número');
      }
    } catch (error) {
      // Error silenciado para el usuario
      Alert.alert('Error', 'Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Error', 'No tienes autorización para realizar esta acción');
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Mensaje de prueba enviado correctamente');
      } else {
        Alert.alert('Error', data.message || 'Error al enviar mensaje de prueba');
      }
    } catch (error) {
      // Error silenciado para el usuario
      Alert.alert('Error', 'Error de conexión al servidor');
    } finally {
      setTestLoading(false);
    }
  };

  const initializeWhatsApp = async () => {
    if (!validatePhone(phone)) {
      Alert.alert(
        'Número requerido',
        'Primero configura un número de teléfono válido'
      );
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Error', 'No tienes autorización para realizar esta acción');
      return;
    }

    Alert.alert(
      'Inicializar WhatsApp',
      'Esto iniciará el servicio de WhatsApp. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inicializar',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${API_BASE_URL}/api/whatsapp/initialize`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tutorPhone: phone }),
              });

              const data = await response.json();
              
              if (data.success) {
                Alert.alert(
                  'Éxito',
                  'Servicio de WhatsApp inicializado correctamente',
                  [{ text: 'OK', onPress: () => getWhatsAppStatus() }]
                );
              } else {
                Alert.alert('Error', data.message || 'Error al inicializar WhatsApp');
              }
            } catch (error) {
              // Error silenciado para el usuario
              Alert.alert('Error', 'Error de conexión al servidor');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className={`mr-4 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#333'} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Configuración WhatsApp
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Configura las notificaciones de WhatsApp
            </Text>
          </View>
        </View>

        {/* Estado actual */}
        <View className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
            Estado del Servicio
          </Text>
          
          {statusLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : whatsappStatus ? (
            <View>
              <View className="flex-row items-center mb-2">
                <View className={`w-3 h-3 rounded-full mr-3 ${whatsappStatus.isReady ? 'bg-green-500' : 'bg-red-500'}`} />
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {whatsappStatus.isReady ? '🟢 WhatsApp Conectado' : '🔴 WhatsApp Desconectado'}
                </Text>
              </View>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Estado: {whatsappStatus.status} | {new Date(whatsappStatus.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No se pudo obtener el estado del servicio
            </Text>
          )}
          
          <TouchableOpacity
            onPress={getWhatsAppStatus}
            className="mt-3 bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              🔄 Actualizar Estado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Configuración del número */}
        <View className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
            Número de WhatsApp
          </Text>
          <Text className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Ingresa el número donde quieres recibir las notificaciones del ESP32.{'\n'}
            Puedes usar cualquier formato: +529983901955, 529983901955, etc.
          </Text>
          
          <TextInput
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="+529983901955 o 9983901955"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            keyboardType="phone-pad"
            className={`border rounded-lg px-4 py-3 mb-4 ${
              isDark 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-black'
            }`}
          />
          
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={updatePhoneNumber}
              disabled={loading || !phone}
              className={`flex-1 py-3 rounded-lg ${
                loading || !phone ? 'bg-gray-400' : 'bg-green-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-medium">
                  💾 Guardar Número
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={initializeWhatsApp}
              disabled={loading || !phone}
              className={`flex-1 py-3 rounded-lg ${
                loading || !phone ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white text-center font-medium">
                🚀 Inicializar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pruebas */}
        <View className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
            Probar Conexión
          </Text>
          <Text className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Envía un mensaje de prueba para verificar que WhatsApp esté funcionando
          </Text>
          
          <TouchableOpacity
            onPress={sendTestMessage}
            disabled={testLoading || !whatsappStatus?.isReady}
            className={`py-3 rounded-lg ${
              testLoading || !whatsappStatus?.isReady ? 'bg-gray-400' : 'bg-orange-600'
            }`}
          >
            {testLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-medium">
                📱 Enviar Mensaje de Prueba
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View className={`p-4 rounded-xl mb-32 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            ℹ️ Información Importante
          </Text>
          <Text className={`text-sm leading-6 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
            • El número debe ser un número de WhatsApp válido y activo{'\n'}
            • Las notificaciones incluyen: presiones de botones, alertas de batería y estado del dispositivo{'\n'}
            • Asegúrate de que el servicio esté inicializado antes de usar el ESP32{'\n'}
            • El número se enviará exactamente como lo escribas (conservando el formato + si lo incluyes){'\n'}
            • Formatos válidos: +529983901955, 529983901955, 9983901955
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar theme={theme} />
    </View>
  );
}
