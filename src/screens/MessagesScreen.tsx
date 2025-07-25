import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../services/messageService';
import { categoryService } from '../services/categoryService';
import { Message, Category, CreateMessageDTO, UpdateMessageDTO } from '../types/api';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { authService } from '../services/authService';
import { API_URL } from '@env';

const MessagesScreen = () => {
  const audioPlayer = useAudioPlayer();
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [playingMessage, setPlayingMessage] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    category_id: '',
  });

  useEffect(() => {
    loadData();
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
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingMessage(null);
    setFormData({ text: '', category_id: '' });
    setShowModal(true);
  };

  const openEditModal = (message: Message) => {
    setEditingMessage(message);
    setFormData({
      text: message.text,
      category_id: message.category_id?.toString() || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMessage(null);
    setFormData({ text: '', category_id: '' });
  };

  const handleSave = async () => {
    if (!formData.text.trim()) {
      Alert.alert('Error', 'El texto del mensaje es requerido');
      return;
    }

    if (!formData.category_id) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    try {
      setLoading(true);

      const messageData = {
        text: formData.text.trim(),
        category_id: parseInt(formData.category_id),
      };

      if (editingMessage) {
        // Actualizar mensaje existente
        await messageService.updateMessage(editingMessage.id, messageData);
        Alert.alert('Éxito', 'Mensaje actualizado correctamente');
      } else {
        // Crear nuevo mensaje
        await messageService.createMessage(messageData);
        Alert.alert('Éxito', 'Mensaje creado correctamente con audio TTS');
      }

      closeModal();
      await loadData();
    } catch (error: any) {
      console.error('Error saving message:', error);
      Alert.alert('Error', error.message || 'Error al guardar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (message: Message) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el mensaje "${message.text}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await messageService.deleteMessage(message.id);
              Alert.alert('Éxito', 'Mensaje eliminado correctamente');
              await loadData();
            } catch (error: any) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', error.message || 'Error al eliminar el mensaje');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
          console.error('Error loading audio:', audioError);
          throw audioError; // Re-throw para que se capture en el catch principal
        }
      } catch (audioError) {
        console.error('Error loading audio:', audioError);
        // Fallback
        playFallbackTTS(message);
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
      Alert.alert('Error', 'No se pudo reproducir el mensaje');
      setPlayingMessage(null);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sin categoría';
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
          console.error(`❌ Error en retry de reproducción:`, error);
        }
      }, 200);
    }

    if (audioStatus.didJustFinish) {
      console.log(`✅ Audio terminó de reproducirse`);
      setPlayingMessage(null);
    }
  }, [audioStatus.didJustFinish, audioStatus.playing, audioStatus.isLoaded, playingMessage]);

  const filteredMessages = messages.filter(
    (message) =>
      message.text.toLowerCase().includes(searchText.toLowerCase()) ||
      (message.category_name &&
        message.category_name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const canModifyMessage = (message: Message) => {
    return user?.role_name === 'admin' || message.created_by === user?.id;
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View className={`mb-3 rounded-xl p-4 shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="mb-2 flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className={`mb-2 text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {item.text}
          </Text>

          <View className="mb-2 flex-row items-center">
            <View className="mr-2 rounded-full bg-blue-500 px-2 py-1">
              <Text className="text-xs font-semibold text-white">
                {item.category_name || 'Sin categoría'}
              </Text>
            </View>
          </View>

          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Por: {item.creator_name || 'Sistema'} |{' '}
            {item.created_at && (
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Creado: {new Date(item.created_at).toLocaleDateString()}
              </Text>
            )}
          </Text>
        </View>

        <View className="flex-row items-center">
          {/* Botón de reproducir TTS */}
          <TouchableOpacity
            onPress={() => playTTS(item)}
            className="mr-2 rounded-lg bg-green-500 p-2">
            <Text style={{ fontSize: 16, color: '#fff' }}>
              {playingMessage === item.id ? '🔊' : '▶️'}
            </Text>
          </TouchableOpacity>

          {/* Botones de edición solo para usuarios con permisos */}
          {canModifyMessage(item) && (
            <>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                className="mr-2 rounded-lg bg-blue-500 p-2">
                <Text style={{ fontSize: 16, color: '#fff' }}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item)}
                className="rounded-lg bg-red-500 p-2">
                <Text style={{ fontSize: 16, color: '#fff' }}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const canCreateMessages = user?.role_name === 'admin' || user?.role_name === 'tutor';

  if (loading && !refreshing) {
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
              💬 Mensajes
            </Text>
            <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Gestión de mensajes con audio
            </Text>
          </View>

          {canCreateMessages && (
            <TouchableOpacity onPress={openCreateModal} className="rounded-xl bg-blue-500 p-3">
              <Text style={{ fontSize: 24, color: '#fff' }}>➕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de búsqueda */}
        <View
          className={`mb-6 flex-row items-center rounded-xl p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <Text style={{ fontSize: 20, color: isDark ? '#9CA3AF' : '#6B7280' }}>🔍</Text>
          <TextInput
            className={`ml-3 flex-1 text-base ${isDark ? 'text-white' : 'text-black'}`}
            placeholder="Buscar mensajes..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        data={filteredMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text style={{ fontSize: 48, color: isDark ? '#4B5563' : '#D1D5DB' }}>💬</Text>
            <Text
              className={`mt-4 text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay mensajes disponibles
            </Text>
            <Text className={`mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchText
                ? 'No se encontraron mensajes con ese texto'
                : 'Aún no se han creado mensajes'}
            </Text>
          </View>
        )}
      />

      {/* Modal para crear/editar mensaje */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View
            className={`max-h-4/5 w-11/12 rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header del modal */}
              <View className="mb-6 flex-row items-center justify-between">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {editingMessage ? 'Editar Mensaje' : 'Crear Mensaje'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={{ fontSize: 24, color: isDark ? '#fff' : '#000' }}>❌</Text>
                </TouchableOpacity>
              </View>

              {/* Campo de texto */}
              <View className="mb-4">
                <Text
                  className={`mb-2 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Texto del mensaje *
                </Text>
                <TextInput
                  className={`rounded-lg border p-3 text-base ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-black'
                  }`}
                  placeholder="Escribe el mensaje aquí..."
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={formData.text}
                  onChangeText={(text) => setFormData({ ...formData, text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Selector de categoría */}
              <View className="mb-6">
                <Text
                  className={`mb-2 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoría *
                </Text>
                <View
                  className={`rounded-lg border ${
                    isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}>
                  <Picker
                    selectedValue={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    style={{ color: isDark ? '#fff' : '#000' }}>
                    <Picker.Item label="Selecciona una categoría" value="" />
                    {categories.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.name}
                        value={category.id.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Botones */}
              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  onPress={closeModal}
                  className={`rounded-lg px-6 py-3 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  className="ml-3 rounded-lg bg-blue-500 px-6 py-3"
                  disabled={loading}>
                  <Text className="font-semibold text-white">
                    {loading ? 'Guardando...' : editingMessage ? 'Actualizar' : 'Crear'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default MessagesScreen;
