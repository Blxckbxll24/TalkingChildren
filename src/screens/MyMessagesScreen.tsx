import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore, ROLES } from '../stores/authStore';
import { childMessageService } from '../services/childMessageService';
import { ChildMessage } from '../types/api';
import Navbar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { API_BASE_URL } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { 
  Play,
  Pause,
  Heart,
  Search,
  Volume2,
  MessageSquare,
  Filter,
  Star,
} from 'lucide-react-native';

const MyMessagesScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const audioPlayer = useAudioPlayer();
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  
  // Estados
  const [childMessages, setChildMessages] = useState<ChildMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastLogTime, setLastLogTime] = useState(0);

  // Memorizar el acceso para evitar rerenders
  const canAccess = useMemo(() => {
    return user?.role_id === ROLES.CHILD || user?.role_name === 'niño';
  }, [user?.role_id, user?.role_name]);

  const loadMyMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Starting to load my messages...');
      console.log('🔍 User info:', user?.email, user?.role_name);
      
      const messages = await childMessageService.getMyMessages();
      
      console.log('📋 Messages received in component:', messages);
      console.log('📊 Message count:', messages.length);
      console.log('🔍 First message structure:', messages[0]);
      
      // Verificar que es un array válido
      if (!Array.isArray(messages)) {
        console.error('❌ Messages is not an array:', typeof messages, messages);
        setError('Datos inválidos recibidos del servidor');
        return;
      }
      
      setChildMessages(messages);
      console.log('✅ Messages set in state, current state will be:', messages.length, 'messages');
      
    } catch (error: any) {
      console.error('❌ Error loading messages in component:', error);
      setError(error.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.role_name]);

  // Solo ejecutar una vez cuando el componente se monta y el usuario puede acceder
  useEffect(() => {
    if (canAccess && !hasInitialized) {
      console.log('🎯 Initializing MyMessages screen for first time');
      setHasInitialized(true);
      loadMyMessages();
    }
  }, [canAccess, hasInitialized, loadMyMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyMessages();
    setRefreshing(false);
  };

  const handlePlayMessage = async (message: ChildMessage) => {
    try {
      const messageId = message.message?.id || message.message_id;
      setPlayingMessageId(messageId);
      
      if (message.message?.audio_url) {
        // Construir la URL completa del audio
        const audioUrl = `${API_BASE_URL}${message.message.audio_url}`;
        console.log('🎵 Playing audio:', audioUrl);
        
        // Obtener token para autenticación
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // Crear archivo temporal para descarga
        const tempFileUri = `${FileSystem.cacheDirectory}audio_${messageId}.mp3`;
        
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
        
        console.log(`🎵 Audio cargado, iniciando reproducción...`);
        await audioPlayer.play();
        
        // Reset cuando termina la reproducción
        setTimeout(() => {
          setPlayingMessageId(null);
        }, 5000); // Duración estimada del audio
        
      } else {
        Alert.alert('Audio no disponible', `El mensaje "${message.message?.text || 'Sin texto'}" no tiene audio asociado`);
        setPlayingMessageId(null);
      }
      
    } catch (error) {
      console.error('Error playing message:', error);
      Alert.alert('Error', 'No se pudo reproducir el mensaje');
      setPlayingMessageId(null);
    }
  };

  const handleToggleFavorite = async (message: ChildMessage) => {
    try {
      await childMessageService.updateMessageAssignment(message.id, {
        is_favorite: !message.is_favorite,
      });
      
      // Actualizar localmente
      setChildMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, is_favorite: !msg.is_favorite }
            : msg
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar el favorito');
    }
  };

  const filteredMessages = childMessages.filter((message: ChildMessage) => {
    const matchesSearch = !searchText || 
      message.message?.text?.toLowerCase().includes(searchText.toLowerCase()) ||
      message.message?.category_name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = !filterFavorites || message.is_favorite;
    
    return matchesSearch && matchesFilter;
  });

  // Solo loguear una vez cada segundo para evitar spam
  const now = Date.now();
  if (now - lastLogTime > 1000) {
    console.log('🔍 Debug MyMessages state:');
    console.log('- childMessages length:', childMessages.length);
    console.log('- filteredMessages length:', filteredMessages.length);
    console.log('- searchText:', searchText);
    console.log('- filterFavorites:', filterFavorites);
    console.log('- canAccess:', canAccess);
    console.log('- loading:', loading);
    console.log('- error:', error);
    console.log('- hasInitialized:', hasInitialized);
    setLastLogTime(now);
  }

  if (!canAccess) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: insets.top,
      }}>
        <MessageSquare size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
        <Text style={{
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: 18,
          textAlign: 'center',
          marginTop: 16,
        }}>
          Solo los niños pueden acceder a esta pantalla
        </Text>
        <Navbar theme={theme} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: insets.top,
      }}>
        <ActivityIndicator size="large" color={isDark ? '#6366f1' : '#8b5cf6'} />
        <Text style={{
          color: isDark ? '#f9fafb' : '#111827',
          marginTop: 16,
          fontSize: 16,
        }}>
          Cargando mensajes...
        </Text>
        <Navbar theme={theme} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: insets.top,
        padding: 32,
      }}>
        <MessageSquare size={64} color={isDark ? '#ef4444' : '#dc2626'} />
        <Text style={{
          color: isDark ? '#ef4444' : '#dc2626',
          fontSize: 18,
          fontWeight: '600',
          textAlign: 'center',
          marginTop: 16,
        }}>
          Error al cargar mensajes
        </Text>
        <Text style={{
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: 14,
          textAlign: 'center',
          marginTop: 8,
        }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={loadMyMessages}
          style={{
            backgroundColor: isDark ? '#6366f1' : '#8b5cf6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Text style={{
            color: 'white',
            fontWeight: '600',
          }}>
            Reintentar
          </Text>
        </TouchableOpacity>
        <Navbar theme={theme} />
      </View>
    );
  }

  const renderMessageItem = ({ item }: { item: ChildMessage }) => {
    console.log('🎨 Rendering message item:', JSON.stringify(item, null, 2));
    
    return (
      <View style={{
        backgroundColor: isDark ? '#374151' : '#ffffff',
        padding: 16,
        margin: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            {/* Categoría */}
            {item.message?.category_name && (
              <View style={{
                backgroundColor: '#3b82f6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                alignSelf: 'flex-start',
                marginBottom: 8,
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                  {item.message.category_name}
                </Text>
              </View>
            )}
            
            {/* Contenido del mensaje */}
            <Text style={{
              fontSize: 16,
              marginBottom: 8,
              color: isDark ? '#d1d5db' : '#374151',
              lineHeight: 22,
            }}>
              {item.message?.text || 'Sin contenido'}
            </Text>
            
            {/* Información adicional */}
            <Text style={{
              fontSize: 12,
              color: isDark ? '#9ca3af' : '#6b7280',
            }}>
              Asignado: {item.assigned_at ? new Date(item.assigned_at).toLocaleDateString('es-ES') : 'Sin fecha'}
            </Text>
            
            {/* Debug info */}
            <Text style={{
              fontSize: 10,
              color: isDark ? '#6b7280' : '#9ca3af',
              marginTop: 4,
            }}>
              ID: {item.id} | Message ID: {item.message?.id} | Favorite: {item.is_favorite.toString()}
            </Text>
          </View>

          {/* Controles */}
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => handlePlayMessage(item)}
              style={{
                backgroundColor: playingMessageId === (item.message?.id || item.message_id) ? '#f59e0b' : '#10b981',
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              {playingMessageId === (item.message?.id || item.message_id) ? (
                <Pause size={20} color="white" />
              ) : (
                <Play size={20} color="white" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item)}
              style={{ padding: 8 }}
            >
              <Heart 
                size={20} 
                color={item.is_favorite ? "#ef4444" : (isDark ? '#9ca3af' : '#6b7280')}
                fill={item.is_favorite ? "#ef4444" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    }}>
      {filterFavorites ? (
        <Star size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
      ) : (
        <MessageSquare size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
      )}
      <Text style={{
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        color: isDark ? '#d1d5db' : '#6b7280',
      }}>
        {filterFavorites ? 'No tienes mensajes favoritos' : 'No tienes mensajes asignados'}
      </Text>
      <Text style={{
        textAlign: 'center',
        marginTop: 8,
        color: isDark ? '#9ca3af' : '#6b7280',
      }}>
        {filterFavorites 
          ? 'Marca mensajes como favoritos para verlos aquí'
          : 'Tu tutor te asignará mensajes que aparecerán aquí'}
      </Text>
    </View>
  );

  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#ffffff',
      paddingTop: insets.top,
    }}>
      {/* Header */}
      <View style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#e5e7eb',
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? '#f9fafb' : '#111827',
          textAlign: 'center',
        }}>
          Mis Mensajes
        </Text>
        <Text style={{
          fontSize: 14,
          color: isDark ? '#9ca3af' : '#6b7280',
          textAlign: 'center',
          marginTop: 4,
        }}>
          {filteredMessages.length} mensaje{filteredMessages.length !== 1 ? 's' : ''} disponible{filteredMessages.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={{ padding: 16 }}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: isDark ? '#374151' : '#f9fafb',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <Search size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar mensajes..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            style={{
              flex: 1,
              marginLeft: 8,
              color: isDark ? '#f9fafb' : '#111827',
              fontSize: 16,
            }}
          />
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          onPress={() => setFilterFavorites(!filterFavorites)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: filterFavorites ? (isDark ? '#7c3aed' : '#8b5cf6') : (isDark ? '#374151' : '#f3f4f6'),
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Heart
            size={20}
            color={filterFavorites ? 'white' : (isDark ? '#9ca3af' : '#6b7280')}
            fill={filterFavorites ? 'white' : 'transparent'}
          />
          <Text style={{
            marginLeft: 8,
            color: filterFavorites ? 'white' : (isDark ? '#d1d5db' : '#374151'),
            fontWeight: '600',
          }}>
            {filterFavorites ? 'Mostrando favoritos' : 'Mostrar solo favoritos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => `message-${item.id}`}
        contentContainerStyle={{ 
          paddingHorizontal: 8, 
          paddingBottom: 100,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[isDark ? '#6366f1' : '#8b5cf6']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        extraData={childMessages} // Asegurar que la lista se actualice cuando cambien los datos
      />

      <Navbar theme={theme} />
    </View>
  );
};

export default MyMessagesScreen;
