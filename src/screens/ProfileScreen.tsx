import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon, LogOut, User, Edit } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

const ProfileScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const loadUserProfile = async () => {
    // El usuario ya está cargado en el store
    console.log('User profile loaded:', user);
  };

  const LabelValue = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-4">
      <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</Text>
      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{value || 'No disponible'}</Text>
    </View>
  );

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'Administrador';
      case 'tutor': return 'Tutor';
      case 'child': return 'Niño';
      default: return roleName;
    }
  };

  const getDefaultAvatar = () => {
    const avatarId = user?.id ? user.id % 10 : 1;
    return `https://i.pravatar.cc/150?img=${avatarId}`;
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Cerrando sesión...
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`} style={{ paddingTop: insets.top }}>
      <View className="items-end px-6 mt-2">
        <TouchableOpacity onPress={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          {isDark ? <Sun size={24} color="#facc15" /> : <Moon size={24} color="#1e3a8a" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 160 }}>
        <View className={`w-full rounded-3xl shadow-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex items-center">
            <View className="relative">
              <Image
                source={{ uri: getDefaultAvatar() }}
                className="w-32 h-32 rounded-full mb-6"
                style={{ borderWidth: 4, borderColor: '#3B82F6' }}
              />
              <View className="absolute bottom-6 right-0 bg-blue-500 rounded-full p-2">
                <User size={20} color="#fff" />
              </View>
            </View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>
              Mi Perfil
            </Text>
            <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              {getRoleDisplayName(user?.role_name || '')}
            </Text>
          </View>

          <View className="mt-6">
            <LabelValue label="Nombre Completo" value={user?.name || ''} />
            <LabelValue label="Correo Electrónico" value={user?.email || ''} />
            <LabelValue label="Rol en el Sistema" value={getRoleDisplayName(user?.role_name || '')} />
            <LabelValue label="ID de Usuario" value={user?.id?.toString() || ''} />
            <LabelValue 
              label="Fecha de Registro" 
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible'} 
            />
          </View>

          {user?.role_name === 'child' && (
            <>
              <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                Información del Perfil
              </Text>
              <View>
                <LabelValue label="Estado" value="Activo" />
                <LabelValue label="Mensajes Disponibles" value="10" />
                <LabelValue label="Categorías Accesibles" value="5" />
              </View>
            </>
          )}

          {user?.role_name === 'tutor' && (
            <>
              <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                Panel de Tutor
              </Text>
              <View>
                <LabelValue label="Niños Asignados" value="3" />
                <LabelValue label="Mensajes Configurados" value="15" />
                <LabelValue label="Estado" value="Activo" />
              </View>
            </>
          )}

          {user?.role_name === 'administrador' && (
            <>
              <Text className={`text-xl font-bold mt-8 mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                Panel de Administración
              </Text>
              <View>
                <LabelValue label="Permisos" value="Acceso Total" />
                <LabelValue label="Usuarios en Sistema" value="25" />
                <LabelValue label="Estado del Sistema" value="Operativo" />
              </View>
            </>
          )}
        </View>
        
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center mt-8 bg-red-600 rounded-xl py-4"
          disabled={loading}
        >
          <LogOut size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default ProfileScreen;
