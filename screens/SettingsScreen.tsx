import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className="flex-1 justify-center items-center">
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          Configuración
        </Text>
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
          Modo actual: {theme}
        </Text>
        <TouchableOpacity
          onPress={toggleTheme}
          className="mt-6 px-4 py-2 bg-blue-600 rounded-md"
        >
          <Text className="text-white font-semibold">
            Cambiar a modo {isDark ? 'claro' : 'oscuro'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navbar al final */}
      <Navbar theme={theme} />
    </View>
  );
};

export default SettingsScreen;
