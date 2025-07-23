import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore, ROLES } from '../stores/authStore';
import { useRelationStore } from '../stores/relationStore';
import { RelationResponse } from '../types/api';
import Navbar from '../components/Navbar';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Heart, 
  Settings,
  Search,
  UserPlus,
  Unlink,
  Eye
} from 'lucide-react-native';

const MyChildrenScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  
  const {
    myChildren,
    childrenLoading,
    loadMyChildren,
    unlinkChild,
  } = useRelationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkChildId, setLinkChildId] = useState('');

  // Solo tutores y administradores pueden acceder
  const canAccess = user?.role_id === ROLES.TUTOR || user?.role_id === ROLES.ADMIN;

  useEffect(() => {
    if (canAccess) {
      loadMyChildren();
    }
  }, [canAccess, loadMyChildren]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyChildren();
    setRefreshing(false);
  };

  const handleUnlinkChild = (relation: RelationResponse) => {
    Alert.alert(
      'Desvincular Niño',
      `¿Estás seguro de que quieres desvincular a ${relation.child.name}? Se eliminarán todos los mensajes asignados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Desvincular', 
          style: 'destructive', 
          onPress: () => unlinkChild(relation.child.id) 
        },
      ]
    );
  };

  const handleViewChildMessages = (childId: number, childName: string) => {
    navigation.navigate('ChildMessagesView', { childId, childName });
  };

  const handleAssignMessages = (childId: number, childName: string) => {
    navigation.navigate('AssignMessages', { childId, childName });
  };

  const filteredChildren = myChildren.filter(relation =>
    relation.child.name.toLowerCase().includes(searchText.toLowerCase()) ||
    relation.child.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderChildItem = ({ item }: { item: RelationResponse }) => (
    <View className={`p-4 m-2 rounded-xl border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Text className="text-white font-bold text-lg">
              {item.child.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {item.child.name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.child.email}
            </Text>
            <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Vinculado: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleViewChildMessages(item.child.id, item.child.name)}
            className="p-2 mr-2"
          >
            <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleAssignMessages(item.child.id, item.child.name)}
            className="p-2 mr-2"
          >
            <MessageCircle size={20} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleUnlinkChild(item)}
            className="p-2"
          >
            <Unlink size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Users size={64} color={isDark ? '#6B7280' : '#9CA3AF'} />
      <Text className={`text-xl font-semibold mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        No tienes niños vinculados
      </Text>
      <Text className={`text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Vincula niños para poder asignarles mensajes y hacer seguimiento de su progreso
      </Text>
      <TouchableOpacity
        onPress={() => setShowLinkModal(true)}
        className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
      >
        <Text className="text-white font-semibold">Vincular Primer Niño</Text>
      </TouchableOpacity>
    </View>
  );

  const LinkChildModal = () => (
    <Modal
      visible={showLinkModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLinkModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className={`w-11/12 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Vincular Niño
          </Text>
          
          <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            ID del Niño
          </Text>
          <TextInput
            value={linkChildId}
            onChangeText={setLinkChildId}
            placeholder="Ingresa el ID del niño"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="numeric"
            className={`w-full px-4 py-3 rounded-xl border mb-4 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-black'
            }`}
          />
          
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={() => {
                setShowLinkModal(false);
                setLinkChildId('');
              }}
              className="px-4 py-2 mr-2"
            >
              <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                // Aquí implementarías la lógica de vincular
                // por ahora solo cerramos el modal
                setShowLinkModal(false);
                setLinkChildId('');
              }}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Vincular</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
      <Navbar title="Mis Niños" />
      
      {/* Barra de búsqueda */}
      <View className="p-4">
        <View className={`flex-row items-center px-4 py-2 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`}>
          <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar niños..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            className={`flex-1 ml-2 ${isDark ? 'text-white' : 'text-black'}`}
          />
        </View>
      </View>

      <FlatList
        data={filteredChildren}
        renderItem={renderChildItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={filteredChildren.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
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

      {/* Botón para vincular nuevo niño */}
      {myChildren.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowLinkModal(true)}
          className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center"
          style={{ 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.25, 
            shadowRadius: 4, 
            elevation: 5 
          }}
        >
          <UserPlus size={24} color="white" />
        </TouchableOpacity>
      )}

      <LinkChildModal />
    </View>
  );
};

export default MyChildrenScreen;
