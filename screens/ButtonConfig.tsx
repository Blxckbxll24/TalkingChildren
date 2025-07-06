import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import BottomNavBar from '../components/Navbar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

interface ButtonItem {
    id: number;
    label: string;
    color: string;
    phrase: string;
}

const buttonData: ButtonItem[] = [
    { id: 1, label: 'Botón azul', color: 'bg-blue-600', phrase: '¿Hola cómo estás?' },
    { id: 2, label: 'Botón naranja', color: 'bg-orange-500', phrase: 'Estoy bien' },
    { id: 3, label: 'Botón verde', color: 'bg-green-600', phrase: 'Adiós, cuídate.' },
    { id: 4, label: 'Botón amarillo', color: 'bg-yellow-400', phrase: 'Nos vemos pronto!' },
];

const ButtonConfigScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const renderItem = ({ item }: { item: ButtonItem }) => (
        <View className={`flex-row items-center p-4 mb-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <View className={`${item.color} w-10 h-10 rounded-full flex items-center justify-center mr-4`}>
                <Text className="text-white font-bold">{item.id}</Text>
            </View>
            <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-black'} font-semibold`}>{item.label}</Text>
                <Text className="italic text-gray-600 dark:text-gray-300">“{item.phrase}”</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Información', item.phrase)} className="mr-4">
                <Feather name="info" size={24} color={isDark ? '#60a5fa' : '#2563eb'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ConfigDetail', { id: item.id })}>
                <Feather name="settings" size={24} color={isDark ? '#9ca3af' : '#4b5563'} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View className={`flex-1   ${isDark ? 'bg-gray-900' : 'bg-white'}`}>


            <View className={`flex-1  mt-24 px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} >
                <Text className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                    Botones disponibles
                </Text>

                <FlatList
                    data={buttonData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>

            {/* <Text className="mt-6 text-gray-700 dark:text-gray-400 font-medium">Categoría: saludos</Text> */}

            <BottomNavBar theme={theme} />
        </View>
    );
};

export default ButtonConfigScreen;
