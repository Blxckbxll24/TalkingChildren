import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import { AudioPlayer, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { 
    Play, 
    Heart, 
    Star,
    Volume2,
    Home,
    Settings
} from 'lucide-react-native';

interface QuickMessage {
    id: string;
    text: string;
    category: string;
    audioUrl?: string;
    isFavorite: boolean;
    color: string;
}

const SmartWatchHomeScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { user } = useAuthStore();
    const { screenWidth, screenHeight } = useDeviceType();
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioPlayer = useAudioPlayer();
    const audioStatus = useAudioPlayerStatus(audioPlayer);

    // Mensajes rápidos optimizados para smartwatch
    const quickMessages: QuickMessage[] = [
        { id: '1', text: 'Hola', category: 'saludos', isFavorite: true, color: 'bg-blue-500' },
        { id: '2', text: 'Gracias', category: 'cortesia', isFavorite: false, color: 'bg-green-500' },
        { id: '3', text: 'Tengo hambre', category: 'necesidades', isFavorite: true, color: 'bg-orange-500' },
        { id: '4', text: 'Quiero agua', category: 'necesidades', isFavorite: false, color: 'bg-blue-400' },
        { id: '5', text: 'Estoy bien', category: 'emociones', isFavorite: false, color: 'bg-green-400' },
        { id: '6', text: 'Adiós', category: 'saludos', isFavorite: true, color: 'bg-purple-500' },
    ];

    const [messages, setMessages] = useState(quickMessages);

    const playMessage = async (message: QuickMessage) => {
        try {
            setLoading(true);
            setPlayingId(message.id);

            // Aquí conectarías con tu API para obtener el audio
            // Por ahora simulamos la reproducción
            Alert.alert('🔊 Reproduciendo', `"${message.text}"`);
            
            // Simular duración de reproducción
            setTimeout(() => {
                setPlayingId(null);
                setLoading(false);
            }, 2000);

        } catch (error) {
            console.error('Error playing message:', error);
            Alert.alert('Error', 'No se pudo reproducir el mensaje');
            setPlayingId(null);
            setLoading(false);
        }
    };

    const toggleFavorite = (id: string) => {
        setMessages(prev => 
            prev.map(msg => 
                msg.id === id ? { ...msg, isFavorite: !msg.isFavorite } : msg
            )
        );
    };

    // Limpiar audio al desmontar
    useEffect(() => {
        return () => {
            // Cleanup if needed
        };
    }, []);

    // Configuraciones específicas para smartwatch
    const isSmallScreen = screenWidth <= 400 && screenHeight <= 400;
    const buttonSize = isSmallScreen ? 80 : 100;
    const fontSize = isSmallScreen ? 12 : 14;
    const padding = isSmallScreen ? 8 : 12;

    const renderMessageButton = ({ item }: { item: QuickMessage }) => {
        const isPlaying = playingId === item.id;
        
        return (
            <View className="items-center m-2">
                <TouchableOpacity
                    style={{ 
                        width: buttonSize, 
                        height: buttonSize,
                        opacity: isPlaying ? 0.7 : 1,
                    }}
                    className={`${item.color} rounded-2xl justify-center items-center shadow-lg ${
                        isPlaying ? 'scale-95' : 'scale-100'
                    }`}
                    onPress={() => playMessage(item)}
                    disabled={loading}
                >
                    {isPlaying ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <View className="items-center">
                            <Play size={isSmallScreen ? 20 : 24} color="#fff" fill="#fff" />
                        </View>
                    )}
                </TouchableOpacity>
                
                <Text 
                    className={`text-center mt-2 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
                    style={{ fontSize, maxWidth: buttonSize + 20 }}
                    numberOfLines={2}
                >
                    {item.text}
                </Text>

                {/* Botón favorito pequeño */}
                <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    className="mt-1"
                >
                    <Heart 
                        size={isSmallScreen ? 12 : 16} 
                        color={item.isFavorite ? '#ef4444' : '#9ca3af'} 
                        fill={item.isFavorite ? '#ef4444' : 'none'}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header compacto para smartwatch */}
            <View 
                className={`flex-row items-center justify-between px-${padding} py-${padding} ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
            >
                <Text 
                    className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: fontSize + 2 }}
                >
                    ¡Hola {user?.name || 'Niño'}!
                </Text>
                <TouchableOpacity>
                    <Settings size={isSmallScreen ? 16 : 20} color={isDark ? '#fff' : '#374151'} />
                </TouchableOpacity>
            </View>

            {/* Grid de mensajes */}
            <View className="flex-1 justify-center">
                <FlatList
                    data={messages}
                    renderItem={renderMessageButton}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ 
                        padding,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    columnWrapperStyle={{ justifyContent: 'space-around' }}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Barra inferior simple */}
            <View 
                className={`flex-row justify-around items-center py-${padding} ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
            >
                <TouchableOpacity className="items-center">
                    <Home size={isSmallScreen ? 16 : 20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                    <Text 
                        className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                        style={{ fontSize: fontSize - 2 }}
                    >
                        Inicio
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center">
                    <Star size={isSmallScreen ? 16 : 20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text 
                        className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        style={{ fontSize: fontSize - 2 }}
                    >
                        Favoritos
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center">
                    <Volume2 size={isSmallScreen ? 16 : 20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text 
                        className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        style={{ fontSize: fontSize - 2 }}
                    >
                        Sonidos
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Indicador de actividad global */}
            {loading && (
                <View className="absolute inset-0 bg-black/20 justify-center items-center">
                    <View 
                        className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                        <Text 
                            className={`mt-2 ${isDark ? 'text-white' : 'text-black'}`}
                            style={{ fontSize }}
                        >
                            Reproduciendo...
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default SmartWatchHomeScreen;
