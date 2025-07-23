import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore, ROLES } from '../stores/authStore';
import { useChildMessages } from '../stores/relationStore';
import { ChildMessage } from '../types/api';
import Navbar from '../components/Navbar';
import { 
  Play,
  Heart,
  Search,
  Volume2,
  MessageSquare,
  Filter
} from 'lucide-react-native';

const MyMessagesScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();
  
  const {
    childMessages,
    messagesLoading,
    loadMyMessages,
  } = useChildMessages();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Solo niños pueden acceder
  const canAccess = user?.role_id === ROLES.CHILD;

  useEffect(() => {
    if (canAccess) {
      loadMyMessages();
    }
  }, [canAccess, loadMyMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyMessages();
    setRefreshing(false);
  };

  const handlePlayMessage = (message: ChildMessage) => {
    // TODO: Implementar reproductor de audio
    console.log('Reproducir mensaje:', message.message?.content);
  };

  const handleToggleFavorite = (message: ChildMessage) => {
    // TODO: Implementar toggle de favorito
    console.log('Toggle favorito:', message.id);
  };

  const filteredMessages = childMessages.filter(message => {
    const matchesSearch = !searchText || 
      message.message?.content?.toLowerCase().includes(searchText.toLowerCase()) ||
      message.message?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      message.message?.category_name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = !filterFavorites || message.is_favorite;
    
    return matchesSearch && matchesFilter;
  });

  const renderMessageItem = ({ item }: { item: ChildMessage }) => (
    <View className={`p-4 m-2 rounded-xl border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          {/* Categoría */}
          {item.message?.category_name && (
            <View className="bg-blue-500 self-start px-2 py-1 rounded-full mb-2">
              <Text className="text-white text-xs font-semibold">
                {item.message.category_name}
              </Text>
            </View>
          )}
          
          {/* Título del mensaje */}
          {item.message?.title && (
            <Text className={`font-semibold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {item.message.title}
            </Text>
          )}
          
          {/* Contenido del mensaje */}
          <Text className={`text-base mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {item.message?.content || 'Sin contenido'}
          </Text>
          
          {/* Información adicional */}
          <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Asignado: {new Date(item.assigned_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Controles */}
        <View className="items-center">
          <TouchableOpacity
            onPress={() => handlePlayMessage(item)}
            className="bg-green-500 w-12 h-12 rounded-full items-center justify-center mb-2"
          >
            <Play size={20} color="white" fill="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleToggleFavorite(item)}
            className="p-2"
          >
            <Heart 
              size={20} 
              color={item.is_favorite ? "#EF4444" : (isDark ? '#9CA3AF' : '#6B7280')}
              fill={item.is_favorite ? "#EF4444" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <MessageSquare size={64} color={isDark ? '#6B7280' : '#9CA3AF'} />
      <Text className={`text-xl font-semibold mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {filterFavorites ? 'No tienes mensajes favoritos' : 'No tienes mensajes asignados'}
      </Text>
      <Text className={`text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {filterFavorites 
          ? 'Marca mensajes como favoritos para verlos aquí'
          : 'Tu tutor te asignará mensajes para que puedas practicar'
        }
      </Text>
    </View>
  );

  if (!canAccess) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Acceso no autorizado
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar title="Mis Mensajes" />
      
      {/* Controles superiores */}
      <View className="p-4 space-y-3">
        {/* Barra de búsqueda */}
        <View className={`flex-row items-center px-4 py-2 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`}>
          <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar mensajes..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            className={`flex-1 ml-2 ${isDark ? 'text-white' : 'text-black'}`}
          />
        </View>

        {/* Filtros */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setFilterFavorites(!filterFavorites)}
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              filterFavorites
                ? 'bg-red-500 border-red-500'
                : isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-300'
            }`}
          >
            <Heart 
              size={16} 
              color={filterFavorites ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')}
              fill={filterFavorites ? 'white' : 'none'}
            />
            <Text className={`ml-2 ${
              filterFavorites ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-700')
            }`}>
              Solo Favoritos
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Volume2 size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredMessages.length} mensaje{filteredMessages.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={filteredMessages.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

export default MyMessagesScreen;
