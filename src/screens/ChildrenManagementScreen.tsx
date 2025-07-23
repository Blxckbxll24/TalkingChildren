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
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { relationService } from '../services/relationService';
import { RelationResponse, User } from '../types/api';
import {
  UserPlus,
  Users,
  Calendar,
  Mail,
  Phone,
  X,
  Search,
  Plus
} from 'lucide-react-native';

const ChildrenManagementScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [children, setChildren] = useState<RelationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const childrenData = await relationService.getMyChildren();
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'No se pudieron cargar los niños');
    } finally {
      setLoading(false);
    }
  };

  const addChild = async () => {
    if (!childEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa el email del niño');
      return;
    }

    try {
      await relationService.createRelation({
        tutor_id: user?.id || 0,
        child_id: 0 // Esto se debe cambiar por la búsqueda del niño por email
      });
      
      Alert.alert('Éxito', 'Niño agregado exitosamente');
      setChildEmail('');
      setShowAddModal(false);
      loadChildren();
    } catch (error: any) {
      console.error('Error adding child:', error);
      Alert.alert('Error', error.message || 'No se pudo agregar el niño');
    }
  };

  const removeChild = (relation: RelationResponse) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar la relación con ${relation.child.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await relationService.deleteRelation(relation.tutor.id, relation.child.id);
              Alert.alert('Éxito', 'Relación eliminada exitosamente');
              loadChildren();
            } catch (error) {
              console.error('Error removing child:', error);
              Alert.alert('Error', 'No se pudo eliminar la relación');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredChildren = children.filter(relation =>
    relation.child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relation.child.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ChildItem = ({ item }: { item: RelationResponse }) => (
    <View className={`rounded-xl p-4 mb-3 shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Users size={20} color="#fff" />
          </View>
          <View>
            <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
              {item.child.name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Relación activa
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => removeChild(item)}
          className="bg-red-500 rounded-full p-2"
        >
          <X size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="space-y-2">
        <View className="flex-row items-center">
          <Mail size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {item.child.email}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Calendar size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Vinculado el {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );

  const AddChildModal = () => (
    <Modal
      visible={showAddModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`w-11/12 rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Agregar Niño
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email del niño
          </Text>
          <TextInput
            value={childEmail}
            onChangeText={setChildEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="email-address"
            autoCapitalize="none"
            className={`w-full px-4 py-3 rounded-xl border mb-4 ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'
            }`}
          />

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              className="flex-1 py-3 rounded-xl border border-gray-400"
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={addChild}
              className="flex-1 py-3 rounded-xl bg-blue-500"
            >
              <Text className="text-center font-semibold text-white">
                Agregar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Cargando niños...
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      style={{ paddingTop: insets.top }}
    >
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                👨‍👩‍👧‍👦 Mis Niños
              </Text>
              <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Gestiona tus relaciones con los niños
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-blue-500 rounded-full p-3"
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center mb-6">
            <View className={`flex-1 flex-row items-center px-4 py-3 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Buscar por nombre o email..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                className={`ml-3 flex-1 ${isDark ? 'text-white' : 'text-black'}`}
              />
            </View>
          </View>

          {/* Stats */}
          <View className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
              Estadísticas
            </Text>
            <Text className={`${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
              Tienes {children.length} niño{children.length !== 1 ? 's' : ''} bajo tu tutela
            </Text>
          </View>
        </View>

        {/* Children List */}
        <View className="px-6 pb-24">
          {filteredChildren.length === 0 ? (
            <View className="items-center py-12">
              <Users size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
              <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'No se encontraron niños' : 'No tienes niños asignados'}
              </Text>
              <Text className={`text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega un niño para comenzar'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredChildren}
              renderItem={ChildItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <AddChildModal />
      <BottomNavBar theme={theme} />
    </View>
  );
};

export default ChildrenManagementScreen;
