import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/api';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Plus, Folder, Edit, Trash2, Search, X, Grid } from 'lucide-react-native';

const CategoriesScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Verificar si el usuario puede crear/editar categorías
  const canManageCategories = user?.role_name === 'admin' || user?.role_name === 'tutor';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error cargando categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        });
        Alert.alert('Éxito', 'Categoría actualizada correctamente');
      } else {
        await categoryService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        });
        Alert.alert('Éxito', 'Categoría creada correctamente');
      }
      
      setShowModal(false);
      await loadCategories();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la categoría');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.deleteCategory(category.id);
              Alert.alert('Éxito', 'Categoría eliminada correctamente');
              await loadCategories();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar la categoría');
            }
          },
        },
      ]
    );
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const CategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => {
        // Por ahora solo mostrar alert, luego implementar navegación a mensajes
        Alert.alert('Categoría', `Ver mensajes de: ${item.name}`);
      }}
      className={`rounded-xl p-4 mb-3 shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {item.name}
            </Text>
          </View>
          {item.description && (
            <Text className={`text-sm ml-13 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {item.description}
            </Text>
          )}
        </View>
        
        {canManageCategories && (
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              className="mr-2 p-2 rounded-lg bg-blue-500"
            >
              <Edit size={16} color="#fff" />
            </TouchableOpacity>
            
            {user?.role_name === 'admin' && (
              <TouchableOpacity
                onPress={() => handleDeleteCategory(item)}
                className="p-2 rounded-lg bg-red-500"
              >
                <Trash2 size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <View className="flex-row items-center justify-between mt-3">
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          ID: {item.id}
        </Text>
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Cargando categorías...
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      style={{ paddingTop: insets.top }}
    >
      <View className="px-6 pt-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Categorías
            </Text>
            <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {filteredCategories.length} categorías
            </Text>
          </View>
          
          {canManageCategories && (
            <TouchableOpacity
              onPress={openCreateModal}
              className="bg-blue-500 rounded-full p-3"
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de búsqueda */}
        <View className={`flex-row items-center rounded-xl p-3 mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <Search size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            placeholder="Buscar categorías..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={searchText}
            onChangeText={setSearchText}
            className={`flex-1 ml-3 ${isDark ? 'text-white' : 'text-black'}`}
          />
        </View>
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={CategoryCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Grid size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
            <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No se encontraron categorías
            </Text>
            <Text className={`text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchText ? 'Intenta con otros términos de búsqueda' : 'Aún no hay categorías creadas'}
            </Text>
          </View>
        )}
      />

      {/* Modal para crear/editar categoría */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="mb-4">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Nombre de la categoría *
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ej: Saludos, Emociones, Necesidades..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                className={`border rounded-xl p-4 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
              />
            </View>

            <View className="mb-6">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Descripción (opcional)
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe el tipo de mensajes que incluirá esta categoría..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`border rounded-xl p-4 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-500 rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">
                {editingCategory ? 'Actualizar' : 'Crear'} Categoría
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default CategoriesScreen;
