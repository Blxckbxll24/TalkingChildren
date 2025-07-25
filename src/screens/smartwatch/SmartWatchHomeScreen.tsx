import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import { Play, Heart, Star, Volume2, Home, Settings, RefreshCw } from 'lucide-react-native';
import { ChildMessageService } from '../../services/childMessageService';
import { ChildMessage } from '../../types/api';

interface SmartWatchMessage {
  id: string;
  text: string;
  category: string;
  audioUrl?: string;
  isFavorite: boolean;
  color: string;
  originalMessage?: ChildMessage;
}

const SmartWatchHomeScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();
  const { screenWidth, screenHeight } = useDeviceType();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SmartWatchMessage[]>([]);
  const [currentView, setCurrentView] = useState<'all' | 'favorites'>('all');

  // Memoizar servicios y colores para evitar recreación en cada render
  const childMessageService = useMemo(() => new ChildMessageService(), []);
  const categoryColors = useMemo(
    () => [
      'bg-blue-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-yellow-500',
      'bg-teal-500',
    ],
    []
  );

  // Cargar mensajes del niño desde la API
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const childMessages = await childMessageService.getMyMessages();

      const smartWatchMessages: SmartWatchMessage[] = childMessages.map((childMsg, index) => ({
        id: childMsg.id.toString(),
        text: childMsg.message?.text || 'Mensaje sin texto',
        category: childMsg.message?.category_name || 'General',
        audioUrl: childMsg.message?.audio_url,
        isFavorite: childMsg.is_favorite,
        color: categoryColors[index % categoryColors.length],
        originalMessage: childMsg,
      }));

      setMessages(smartWatchMessages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
      // En caso de error, mostrar algunos mensajes por defecto
      setMessages([
        { id: '1', text: 'Hola', category: 'Saludos', isFavorite: false, color: 'bg-blue-500' },
        {
          id: '2',
          text: 'Gracias',
          category: 'Cortesía',
          isFavorite: false,
          color: 'bg-green-500',
        },
        {
          id: '3',
          text: 'Tengo hambre',
          category: 'Necesidades',
          isFavorite: false,
          color: 'bg-orange-500',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [childMessageService, categoryColors]);

  // Refrescar mensajes
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  // Reproducir mensaje con audio
  const playMessage = async (message: SmartWatchMessage) => {
    try {
      setPlayingId(message.id);

      if (message.audioUrl) {
        // Reproducir audio real si está disponible
        try {
          // Intentar reproducir el audio (la API de expo-audio puede variar)
          Alert.alert('🔊 Reproduciendo Audio', `"${message.text}"`);
          // Simular duración de audio
          setTimeout(() => {
            setPlayingId(null);
          }, 3000);
        } catch (audioError) {
          console.log('Error con audio, mostrando texto:', audioError);
          Alert.alert('🔊 Reproduciendo', `"${message.text}"`);
          setTimeout(() => {
            setPlayingId(null);
          }, 2000);
        }
      } else {
        // Si no hay audio, mostrar texto y simular reproducción
        Alert.alert('🔊 Reproduciendo', `"${message.text}"`);
        setTimeout(() => {
          setPlayingId(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error reproduciendo mensaje:', error);
      Alert.alert('Error', 'No se pudo reproducir el mensaje');
      setPlayingId(null);
    }
  };

  // Alternar favorito
  const toggleFavorite = async (message: SmartWatchMessage) => {
    try {
      if (message.originalMessage) {
        // Actualizar en el servidor si es un mensaje real
        const newFavoriteStatus = !message.isFavorite;
        // Aquí podrías llamar al servicio para actualizar el favorito
        // await childMessageService.updateMessage(message.originalMessage.id, { is_favorite: newFavoriteStatus });

        // Actualizar localmente
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, isFavorite: newFavoriteStatus } : msg
          )
        );
      } else {
        // Solo actualizar localmente para mensajes de ejemplo
        setMessages((prev) =>
          prev.map((msg) => (msg.id === message.id ? { ...msg, isFavorite: !msg.isFavorite } : msg))
        );
      }
    } catch (error) {
      console.error('Error actualizando favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar el favorito');
    }
  };

  // Cargar mensajes al montar el componente
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Configuraciones específicas para smartwatch
  const isSmallScreen = screenWidth <= 400 && screenHeight <= 400;
  const buttonSize = isSmallScreen ? 70 : 90;
  const fontSize = isSmallScreen ? 10 : 12;
  const padding = isSmallScreen ? 6 : 10;

  // Filtrar mensajes según la vista actual
  const filteredMessages =
    currentView === 'favorites' ? messages.filter((msg) => msg.isFavorite) : messages;

  const renderMessageButton = ({ item }: { item: SmartWatchMessage }) => {
    const isPlaying = playingId === item.id;

    return (
      <View className="m-1 items-center">
        <TouchableOpacity
          style={{
            width: buttonSize,
            height: buttonSize,
            opacity: isPlaying ? 0.7 : 1,
          }}
          className={`${item.color} items-center justify-center rounded-2xl shadow-lg ${
            isPlaying ? 'scale-95' : 'scale-100'
          }`}
          onPress={() => playMessage(item)}
          disabled={loading}>
          {isPlaying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View className="items-center">
              <Play size={isSmallScreen ? 16 : 20} color="#fff" fill="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text
          className={`mt-1 text-center font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
          style={{ fontSize, maxWidth: buttonSize + 10 }}
          numberOfLines={2}>
          {item.text}
        </Text>

        {/* Botón favorito pequeño */}
        <TouchableOpacity
          onPress={() => toggleFavorite(item)}
          className="mt-1"
          style={{ padding: 2 }}>
          <Heart
            size={isSmallScreen ? 10 : 12}
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
        }`}>
        <Text
          className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: fontSize + 2 }}>
          ¡Hola {user?.name || 'Niño'}!
        </Text>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={loadMessages}>
            <RefreshCw size={isSmallScreen ? 14 : 16} color={isDark ? '#fff' : '#374151'} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Settings size={isSmallScreen ? 14 : 16} color={isDark ? '#fff' : '#374151'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contador de mensajes */}
      <View className={`px-${padding} py-2`}>
        <Text className={`text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {filteredMessages.length} mensajes disponibles
        </Text>
      </View>

      {/* Grid de mensajes */}
      <View className="flex-1 justify-center">
        {loading && messages.length === 0 ? (
          <View className="items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            <Text className={`mt-2 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontSize }}>
              Cargando mensajes...
            </Text>
          </View>
        ) : filteredMessages.length === 0 ? (
          <View className="items-center justify-center px-4">
            <Text
              className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ fontSize }}>
              {currentView === 'favorites'
                ? 'No tienes mensajes favoritos aún'
                : 'No hay mensajes disponibles'}
            </Text>
            <TouchableOpacity
              onPress={loadMessages}
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2">
              <Text className="text-xs text-white">Recargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredMessages}
            renderItem={renderMessageButton}
            keyExtractor={(item) => item.id}
            numColumns={isSmallScreen ? 2 : 3}
            contentContainerStyle={{
              padding: padding / 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            columnWrapperStyle={
              filteredMessages.length > 1 ? { justifyContent: 'space-around', flex: 1 } : undefined
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[isDark ? '#fff' : '#000']}
                tintColor={isDark ? '#fff' : '#000'}
              />
            }
          />
        )}
      </View>

      {/* Barra inferior simple */}
      <View
        className={`flex-row items-center justify-around py-${padding} ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
        <TouchableOpacity className="items-center" onPress={() => setCurrentView('all')}>
          <Home
            size={isSmallScreen ? 14 : 16}
            color={
              currentView === 'all'
                ? isDark
                  ? '#60a5fa'
                  : '#3b82f6'
                : isDark
                  ? '#9ca3af'
                  : '#6b7280'
            }
          />
          <Text
            className={`mt-1 text-xs ${
              currentView === 'all'
                ? isDark
                  ? 'text-blue-400'
                  : 'text-blue-600'
                : isDark
                  ? 'text-gray-400'
                  : 'text-gray-600'
            }`}
            style={{ fontSize: fontSize - 2 }}>
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={() => setCurrentView('favorites')}>
          <Star
            size={isSmallScreen ? 14 : 16}
            color={
              currentView === 'favorites'
                ? isDark
                  ? '#fbbf24'
                  : '#f59e0b'
                : isDark
                  ? '#9ca3af'
                  : '#6b7280'
            }
            fill={currentView === 'favorites' ? '#fbbf24' : 'none'}
          />
          <Text
            className={`mt-1 text-xs ${
              currentView === 'favorites'
                ? isDark
                  ? 'text-yellow-400'
                  : 'text-yellow-600'
                : isDark
                  ? 'text-gray-400'
                  : 'text-gray-600'
            }`}
            style={{ fontSize: fontSize - 2 }}>
            Favoritos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center" onPress={loadMessages}>
          <Volume2 size={isSmallScreen ? 14 : 16} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text
            className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            style={{ fontSize: fontSize - 2 }}>
            Recargar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de actividad global */}
      {playingId && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <View className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            <Text
              className={`mt-2 text-center ${isDark ? 'text-white' : 'text-black'}`}
              style={{ fontSize }}>
              Reproduciendo mensaje...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SmartWatchHomeScreen;
