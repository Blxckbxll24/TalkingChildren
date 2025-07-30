import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { 
  Sun, 
  Moon, 
  Shield, 
  User, 
  LogOut,
  MessageCircle,
  Settings
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
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

        {/* <SettingItem
          icon={<MessageCircle size={24} color="#25D366" />}
          title="Configuración WhatsApp"
          subtitle="Configurar notificaciones de WhatsApp"
          onPress={() => navigation.navigate('WhatsAppConfig')}
        /> */}

        {/* Configuraciones adicionales para admin */}
        {/* {user?.role_name === 'administrador' && (
          <>
            <Text className={`text-xl font-bold mb-4 mt-8 ${isDark ? 'text-white' : 'text-black'}`}>
              Configuración Avanzada
            </Text>
            
            <SettingItem
              icon={<Settings size={24} color="#8B5CF6" />}
              title="Configuración de Botones"
              subtitle="Personalizar botones del dispositivo"
              onPress={() => navigation.navigate('Button')}
            />
          </>
        )} */}

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
