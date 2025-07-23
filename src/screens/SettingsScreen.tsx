import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Shield, 
  User, 
  Settings as SettingsIcon,
  LogOut,
  RefreshCw
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Estados locales para configuraciones
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch, 
    switchValue, 
    onSwitchChange,
    showArrow = true 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={showSwitch}
      className={`flex-row items-center p-4 mb-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
    >
      <View className="mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </Text>
        )}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#767577', true: '#3B82F6' }}
          thumbColor={switchValue ? '#fff' : '#f4f3f4'}
        />
      ) : showArrow && (
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {'>'} 
        </Text>
      )}
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar Caché',
      'Esto eliminará los datos temporales de la aplicación. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: () => {
            // Aquí implementarías la lógica para limpiar caché
            Alert.alert('Éxito', 'Caché limpiado correctamente');
          },
        },
      ]
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`} style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
          Configuración
        </Text>
        <Text className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Personaliza tu experiencia
        </Text>

        {/* Sección: Apariencia */}
        <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Apariencia
        </Text>
        
        <SettingItem
          icon={isDark ? <Sun size={24} color="#facc15" /> : <Moon size={24} color="#1e3a8a" />}
          title="Tema de la aplicación"
          subtitle={`Modo ${isDark ? 'oscuro' : 'claro'} activado`}
          showSwitch={true}
          switchValue={isDark}
          onSwitchChange={toggleTheme}
        />

        {/* Sección: Audio y Notificaciones */}
        <Text className={`text-xl font-bold mb-4 mt-8 ${isDark ? 'text-white' : 'text-black'}`}>
          Audio y Notificaciones
        </Text>
        
        <SettingItem
          icon={soundEnabled ? <Volume2 size={24} color="#3B82F6" /> : <VolumeX size={24} color="#6B7280" />}
          title="Sonido de la aplicación"
          subtitle="Activar sonidos del sistema"
          showSwitch={true}
          switchValue={soundEnabled}
          onSwitchChange={setSoundEnabled}
        />

        <SettingItem
          icon={notificationsEnabled ? <Bell size={24} color="#3B82F6" /> : <BellOff size={24} color="#6B7280" />}
          title="Notificaciones"
          subtitle="Recibir alertas importantes"
          showSwitch={true}
          switchValue={notificationsEnabled}
          onSwitchChange={setNotificationsEnabled}
        />

        <SettingItem
          icon={<RefreshCw size={24} color={autoSpeakEnabled ? "#3B82F6" : "#6B7280"} />}
          title="Pronunciación automática"
          subtitle="Hablar mensajes al seleccionarlos"
          showSwitch={true}
          switchValue={autoSpeakEnabled}
          onSwitchChange={setAutoSpeakEnabled}
        />

        {/* Sección: Cuenta */}
        <Text className={`text-xl font-bold mb-4 mt-8 ${isDark ? 'text-white' : 'text-black'}`}>
          Mi Cuenta
        </Text>
        
        <SettingItem
          icon={<User size={24} color="#3B82F6" />}
          title="Perfil de usuario"
          subtitle={user?.name || 'Ver información personal'}
          onPress={() => navigation.navigate('Profile')}
        />

        {user?.role_name === 'admin' && (
          <SettingItem
            icon={<Shield size={24} color="#DC2626" />}
            title="Panel de administración"
            subtitle="Gestionar usuarios y sistema"
            onPress={() => {
              // Navegar a panel admin
              Alert.alert('Info', 'Panel de administración próximamente');
            }}
          />
        )}

        {/* Sección: Sistema */}
        <Text className={`text-xl font-bold mb-4 mt-8 ${isDark ? 'text-white' : 'text-black'}`}>
          Sistema
        </Text>
        
        <SettingItem
          icon={<SettingsIcon size={24} color="#6B7280" />}
          title="Limpiar caché"
          subtitle="Liberar espacio de almacenamiento"
          onPress={handleClearCache}
        />

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center mt-8 mb-32 bg-red-600 rounded-xl py-4"
        >
          <LogOut size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text className="text-white font-semibold text-lg">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Navbar theme={theme} />
    </View>
  );
};

export default SettingsScreen;
