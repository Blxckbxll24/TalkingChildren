import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../services/messageService';
import { categoryService } from '../services/categoryService';
import { Message, Category } from '../types/api';
import { API_URL } from '@env';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { authService } from '../services/authService';
import { Play, Volume2, Heart, HeartOff, Grid, List, Speaker } from 'lucide-react-native';

const TTSDashboardScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingMessage, setPlayingMessage] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteMessages, setFavoriteMessages] = useState<number[]>([]);

  // Audio player
  const audioPlayer = useAudioPlayer();
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Configurar audio session para reproducir sonido
        console.log(`🔧 Configurando audio session...`);
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
        console.log(`✅ Audio session configurada`);

        loadData();
      } catch (error) {
        // Error silenciado para el usuario
        loadData(); // Continuar aunque falle la configuración de audio
      }
    };

    initializeAudio();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, categoriesData] = await Promise.all([
        messageService.getAllMessages(),
        categoryService.getAllCategories(),
      ]);
      setMessages(messagesData);
      setCategories(categoriesData);

      // Cargar favoritos del usuario (simulado)
      setFavoriteMessages([1, 3, 5]); // IDs de mensajes favoritos
    } catch (error) {
      // Error silenciado para el usuario
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = selectedCategory
    ? messages.filter((m) => m.category_id === selectedCategory)
    : messages;

  const playTTS = async (message: Message) => {
    try {
      // Si ya se está reproduciendo el mismo mensaje, pausar/reanudar
      if (playingMessage === message.id) {
        if (audioStatus.isLoaded && audioStatus.playing) {
          audioPlayer.pause();
          return;
        } else if (audioStatus.isLoaded && !audioStatus.playing) {
          audioPlayer.play();
          return;
        }
      }

      // Detener reproducción actual si hay una
      if (playingMessage !== null && audioStatus.isLoaded) {
        audioPlayer.remove();
      }

      setPlayingMessage(message.id);

      try {
        console.log(`🔊 Intentando reproducir audio para mensaje ${message.id}`);

        const token = await authService.getToken();
        if (!token) {
          throw new Error('No hay token de autenticación disponible');
        }

        // Usar la URL de la variable de entorno
        const baseUrl = __DEV__ ? `http://${API_URL}` : 'https://tu-dominio-produccion.com';

        // Usar la URL directa del audio con token en header
        const audioUrl = `${baseUrl}/api/messages/${message.id}/audio`;

        console.log(`🔑 Cargando audio desde: ${audioUrl}`);

        try {
          // Método simplificado: usar directamente la URL con autenticación en headers
          // Si expo-audio no soporta headers custom, usar FileSystem como fallback

          if (Platform.OS === 'web') {
            // En web, hacer fetch y usar blob
            const response = await fetch(audioUrl, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            const localUrl = URL.createObjectURL(audioBlob);

            audioPlayer.replace(localUrl);
          } else {
            // En mobile, usar expo-file-system para descargar y reproducir
            const FileSystem = require('expo-file-system');
            const tempFileUri = `${FileSystem.documentDirectory}temp_audio_${message.id}.mp3`;

            console.log(`📁 Descargando audio a: ${tempFileUri}`);

            // Descargar el archivo
            const downloadResult = await FileSystem.downloadAsync(audioUrl, tempFileUri, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (downloadResult.status !== 200) {
              throw new Error(`Download failed with status ${downloadResult.status}`);
            }

            console.log(`✅ Audio descargado, cargando en reproductor...`);
            await audioPlayer.replace(downloadResult.uri);
          }

          console.log(`🎵 Audio cargado, iniciando reproducción...`);
          await audioPlayer.play();
        } catch (audioError) {
          // Error silenciado para el usuario
          throw audioError; // Re-throw para que se capture en el catch principal
        }
      } catch (audioError) {
        // Error silenciado para el usuario
        // Fallback
        playFallbackTTS(message);
      }
    } catch (error) {
      // Error silenciado para el usuario
      Alert.alert('Error', 'No se pudo reproducir el mensaje');
      setPlayingMessage(null);
    }
  };

  const playFallbackTTS = (message: Message) => {
    Alert.alert(
      'Reproduciendo TTS 🔊',
      `"${message.text}"\n\nCategoría: ${getCategoryName(message.category_id)}\n\nNota: No se encontró el archivo de audio, mostrando texto solamente.`,
      [
        {
          text: 'Cerrar',
          onPress: () => {
            setPlayingMessage(null);
          },
        },
      ]
    );

    // Simular duración
    const duration = Math.max(3000, message.text.length * 150);
    setTimeout(() => {
      setPlayingMessage(null);
    }, duration);
  };

  // Escuchar cambios en el estado del audio
  useEffect(() => {
    console.log(`🎵 Audio status changed:`, {
      isLoaded: audioStatus.isLoaded,
      playing: audioStatus.playing,
      didJustFinish: audioStatus.didJustFinish,
      duration: audioStatus.duration,
      currentlyPlaying: playingMessage,
    });

    // Si el audio se cargó pero no está reproduciendo, intentar reproducir
    if (audioStatus.isLoaded && !audioStatus.playing && playingMessage !== null) {
      console.log(`🔄 Audio cargado pero no reproduciendo, intentando play() de nuevo...`);
      setTimeout(() => {
        try {
          audioPlayer.play();
          console.log(`✅ Reproducción iniciada después de retry`);
        } catch (error) {
          // Error silenciado para el usuario
        }
      }, 200);
    }

    if (audioStatus.didJustFinish) {
      console.log(`✅ Audio terminó de reproducirse`);
      setPlayingMessage(null);
    }
  }, [audioStatus.didJustFinish, audioStatus.playing, audioStatus.isLoaded, playingMessage]);

  const toggleFavorite = (messageId: number) => {
    setFavoriteMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const getCategoryColor = (categoryId: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-pink-500',
    ];
    return colors[categoryId % colors.length];
  };

  const MessageGridItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onPress={() => playTTS(item)}
      className={`m-2 rounded-xl p-4 shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      style={{ width: '45%' }}>
      <View className="items-center">
        <View
          className={`mb-3 h-16 w-16 items-center justify-center rounded-full ${getCategoryColor(item.category_id)}`}>
          {playingMessage === item.id && audioStatus.playing ? (
            <Volume2 size={24} color="#fff" />
          ) : (
            <Play size={24} color="#fff" />
          )}
        </View>

        <Text
          className={`mb-1 text-center text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}
          numberOfLines={2}>
          {item.text}
        </Text>

        <Text
          className={`mb-2 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          numberOfLines={2}>
          {item.category_name || 'Sin categoría'}
        </Text>

        <View className="w-full flex-row items-center justify-between">
          <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {getCategoryName(item.category_id)}
          </Text>

          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            {favoriteMessages.includes(item.id) ? (
              <Heart size={16} color="#EF4444" fill="#EF4444" />
            ) : (
              <HeartOff size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MessageListItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onPress={() => playTTS(item)}
      className={`mb-3 flex-row items-center rounded-xl p-4 shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <View
        className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${getCategoryColor(item.category_id)}`}>
        {playingMessage === item.id && audioStatus.playing ? (
          <Volume2 size={20} color="#fff" />
        ) : (
          <Play size={20} color="#fff" />
        )}
      </View>

      <View className="mr-3 flex-1">
        <Text className={`mb-1 font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          {item.text}
        </Text>
        <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} numberOfLines={2}>
          {item.category_name || 'Sin categoría'}
        </Text>
        <Text className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {getCategoryName(item.category_id)}
        </Text>
      </View>

      <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
        {favoriteMessages.includes(item.id) ? (
          <Heart size={20} color="#EF4444" fill="#EF4444" />
        ) : (
          <HeartOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const CategoryFilter = ({ category }: { category: Category }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
      className={`mr-3 rounded-full px-4 py-2 ${
        selectedCategory === category.id ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
      <Text
        className={`font-semibold ${
          selectedCategory === category.id
            ? 'text-white'
            : isDark
              ? 'text-gray-300'
              : 'text-gray-700'
        }`}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-6">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Dashboard
            </Text>
            <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {user?.role_name === 'niño' && `¡Hola ${user.name}!`}
              {user?.role_name === 'tutor' && 'Mensajes para tus niños'}
              {user?.role_name === 'administrador' && 'Todos los mensajes'}
            </Text>
          </View>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`rounded-lg p-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {viewMode === 'grid' ? (
                <List size={20} color={isDark ? '#fff' : '#000'} />
              ) : (
                <Grid size={20} color={isDark ? '#fff' : '#000'} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ paddingRight: 24 }}>
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            className={`mr-3 rounded-full px-4 py-2 ${
              selectedCategory === null ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
            <Text
              className={`font-semibold ${
                selectedCategory === null
                  ? 'text-white'
                  : isDark
                    ? 'text-gray-300'
                    : 'text-gray-700'
              }`}>
              Todos
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <CategoryFilter key={category.id} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Lista de mensajes */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredMessages}
          renderItem={MessageGridItem}
          keyExtractor={(item: Message) => item.id.toString()}
          numColumns={2}
          key={`grid-${2}`} // Usa el valor de numColumns aquí
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <Speaker size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
              <Text
                className={`mt-4 text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay mensajes disponibles
              </Text>
              <Text className={`mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedCategory ? 'Selecciona otra categoría' : 'Aún no hay mensajes creados'}
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={MessageListItem}
          keyExtractor={(item: Message) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <Speaker size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
              <Text
                className={`mt-4 text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay mensajes disponibles
              </Text>
              <Text className={`mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedCategory ? 'Selecciona otra categoría' : 'Aún no hay mensajes creados'}
              </Text>
            </View>
          )}
        />
      )}

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default TTSDashboardScreen;
