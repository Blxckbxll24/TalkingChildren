import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavBar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

interface StatItem {
  id: string;
  value: string | number;
  label: string;
  isItalic?: boolean;
}

interface ButtonItem {
  id: string;
  color: string;
  label: string;
}

const statsData: StatItem[] = [
  { id: '1', value: 37, label: 'Frases Dichas' },
  { id: '2', value: '“Quiero ir al baño”', label: 'Frase más usada', isItalic: true },
  { id: '3', value: 10, label: 'Palabras Dichas' },
  { id: '4', value: 37, label: 'Frases Utilizables' },
];

const buttonsData: ButtonItem[] = [
  { id: '1', color: 'bg-blue-600', label: 'Botón Azul' },
  { id: '2', color: 'bg-orange-500', label: 'Botón Naranja' },
  { id: '3', color: 'bg-green-600', label: 'Botón Verde' },
  { id: '4', color: 'bg-yellow-400', label: 'Botón Amarillo' },
];

const HomeScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const renderStatItem = ({ item }: { item: StatItem }) => (
    <View
      className={`rounded-xl p-4 shadow m-2 flex-1 ${isDark ? 'bg-gray-700' : 'bg-white'}`}
      style={{ minWidth: 140, maxWidth: 160 }}
    >
      <Text
        className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}
        style={item.isItalic ? { fontStyle: 'italic' } : undefined}
      >
        {item.value}
      </Text>
      <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
        {item.label}
      </Text>
    </View>
  );

  const renderButtonItem = ({ item }: { item: ButtonItem }) => (
    <View className="flex-row items-center m-2">
      <View className={`${item.color} w-8 h-8 rounded-full mr-4`} />
      <Text className={`${isDark ? 'text-white' : 'text-black'}`}>{item.label}</Text>
    </View>
  );

  return (
    <View className={`${isDark ? 'bg-gray-900' : 'bg-white'} flex-1`}>
      <View style={{ paddingTop: insets.top }} className="flex-1 p-6 mt-8">
        <Text className={`${isDark ? 'text-white' : 'text-black'} text-3xl font-bold mb-6`}>
          Inicio
        </Text>

        <View
          className={`rounded-2xl p-6 shadow mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <Text className={`${isDark ? 'text-white' : 'text-black'} text-xl font-semibold mb-4`}>
            Estadísticas rápidas
          </Text>
          <FlatList
            data={statsData}
            renderItem={renderStatItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
          />
        </View>

        <View
          className={`rounded-2xl p-6 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <Text className={`${isDark ? 'text-white' : 'text-black'} text-xl font-semibold mb-4`}>
            Botones rápidos
          </Text>
          <FlatList
            data={buttonsData}
            renderItem={renderButtonItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </View>

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default HomeScreen;
