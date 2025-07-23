import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react-native';

const voices = [
    'Voz 1 - Español',
    'Voz 2 - Inglés',
    'Voz 3 - Francés',
    'Voz 4 - Alemán',
];

const ButtonConfigDetailScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params as { id: number };

    const [message, setMessage] = useState('');
    const [showVoiceSelect, setShowVoiceSelect] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('');

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

            <View className={`flex-1 mt-24 px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>

            {/* Botón de regresar */}
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4 flex-row items-center">
                <ArrowLeft size={24} color={isDark ? 'white' : 'black'} />
                <Text className={`ml-2 text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    Regresar
                </Text>
            </TouchableOpacity>

            <Text className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                Configurar Botón #{id}
            </Text>

            <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Mensaje del botón
            </Text>
            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Escribe el mensaje..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                className="w-full px-4 py-3 mb-6 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
            />

            <TouchableOpacity
                onPress={() => setShowVoiceSelect(!showVoiceSelect)}
                className="mb-4 bg-purple-600 py-3 rounded-xl"
            >
                <Text className="text-white font-semibold text-center">Seleccionar voz</Text>
            </TouchableOpacity>

            {showVoiceSelect && (
                <Picker
                    selectedValue={selectedVoice}
                    onValueChange={(value: string) => setSelectedVoice(value)}
                    style={{ color: isDark ? 'white' : 'black' }}
                >
                    <Picker.Item label="Selecciona una voz" value="" />
                    {voices.map((voice, index) => (
                        <Picker.Item key={index} label={voice} value={voice} />
                    ))}
                </Picker>
            )}
            </View>
            <BottomNavBar theme={theme} />
        </View>
    );
};

export default ButtonConfigDetailScreen;
