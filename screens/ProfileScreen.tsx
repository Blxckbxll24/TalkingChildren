import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const userData = {
  nombre: 'Vianey S. Alvarez',
  fechaNacimiento: '05/02/2004',
  correo: 'usuario1@gmail.com',
  genero: 'Femenino',
  contactoEmergencia: {
    correo: 'emerg@gmail.com',
    telefono: '999-999-999',
  },
  avatar: 'https://i.pravatar.cc/150?img=12',
};

const ProfileScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const LabelValue = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-4">
      <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</Text>
      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{value}</Text>
    </View>
  );

  const handleLogout = () => {
    navigation.navigate('Login');
    console.log('Cerrar sesión');
  };

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
            <Image
              source={{ uri: userData.avatar }}
              className="w-32 h-32 rounded-full mb-6"
              style={{ borderWidth: 4, borderColor: '#3B82F6' }}
            />
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>
              Información Básica
            </Text>
          </View>

          <View className="mt-6">
            <LabelValue label="Nombre" value={userData.nombre} />
            <LabelValue label="Fecha de Nacimiento" value={userData.fechaNacimiento} />
            <LabelValue label="Correo Electrónico" value={userData.correo} />
            <LabelValue label="Género" value={userData.genero} />
          </View>

          <Text className={`text-xl font-bold mt-10 mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Contacto de Emergencia
          </Text>
          <View>
            <LabelValue label="Correo Electrónico" value={userData.contactoEmergencia.correo} />
            <LabelValue label="Teléfono" value={userData.contactoEmergencia.telefono} />
          </View>
        </View>
        
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center mt-8 bg-red-600 rounded-xl py-3"
        >
          <LogOut size={20} color="#fff" className="mr-2" />
          <Text className="text-white font-semibold">Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default ProfileScreen;
