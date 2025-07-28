import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { API_URL } from '@env';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Configuración de la URL base
const API_BASE_URL = `http://${API_URL}/api`;

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

const ROLES = [
  { id: 1, name: 'Administrador' },
  { id: 2, name: 'Tutor' },
  { id: 3, name: 'Niño' },
];

class UserService {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request(url: string, options: RequestInit = {}) {
    const config: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${url}`, config);
    const data = await response.json();

    if (!data.success && response.status >= 400) {
      throw new Error(data.details || data.message || 'Error en la petición');
    }

    return data;
  }

  async getAll(): Promise<User[]> {
    const response = await this.request('/users');
    return response.data;
  }

  async create(userData: UserFormData): Promise<User> {
    const response = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async update(id: number, updateData: Partial<UserFormData>): Promise<User> {
    const response = await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  }

  async delete(id: number): Promise<boolean> {
    const response = await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }
}

const UsersScreen = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role_id: 3,
  });

  // Obtener token del AsyncStorage
  const getToken = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        return storedToken;
      }
    } catch (error) {
      
    }
    return '';
  }, []);

  const fetchUsers = useCallback(async () => {
    const authToken = token || (await getToken());
    if (!authToken) {
      setError('No se encontró token de autenticación');
      return;
    }

    const userService = new UserService(API_BASE_URL, authToken);
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getAll();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error obteniendo usuarios');
    } finally {
      setLoading(false);
    }
  }, [token, getToken]);

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    const authToken = token || (await getToken());
    if (!authToken) {
      Alert.alert('Error', 'No se encontró token de autenticación');
      return;
    }

    const userService = new UserService(API_BASE_URL, authToken);
    setLoading(true);
    try {
      if (editingUser) {
        const updateData: Partial<UserFormData> = {
          name: formData.name,
          email: formData.email,
          role_id: formData.role_id,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        const updatedUser = await userService.update(editingUser.id, updateData);
        setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? updatedUser : user)));
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        const newUser = await userService.create(formData);
        setUsers((prev) => [...prev, newUser]);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }
      setModalVisible(false);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error procesando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert('Confirmar eliminación', `¿Estás seguro de que quieres eliminar a ${user.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const authToken = token || (await getToken());
          if (!authToken) {
            Alert.alert('Error', 'No se encontró token de autenticación');
            return;
          }

          const userService = new UserService(API_BASE_URL, authToken);
          setLoading(true);
          try {
            await userService.delete(user.id);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            Alert.alert('Éxito', 'Usuario eliminado correctamente');
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Error eliminando usuario');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: 3,
    });
    setEditingUser(null);
  };

  const getRoleName = (roleId: number) => {
    return ROLES.find((role) => role.id === roleId)?.name || 'Desconocido';
  };

  useEffect(() => {
    getToken().then(() => {
      fetchUsers();
    });
  }, [getToken, fetchUsers]);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`px-10 py-20 shadow-sm`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Usuarios
          </Text>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
            className="flex-row items-center rounded-lg bg-blue-500 px-4 py-2">
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="ml-1 font-medium text-white">Nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-6 py-[-50px]"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}>
          {loading && (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cargando usuarios...
              </Text>
            </View>
          )}

          {error && (
            <View className="mb-4 rounded-lg border border-red-400 bg-red-100 p-4">
              <Text className="text-red-700">{error}</Text>
              <TouchableOpacity onPress={fetchUsers} className="mt-2">
                <Text className="font-medium text-red-600">Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading &&
            !error &&
            users.map((user) => (
              <View
                key={user.id}
                className={`mb-4 rounded-lg p-4 shadow-sm ${
                  isDark ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'
                }`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </Text>
                    <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.email}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <MaterialIcons
                        name="badge"
                        size={16}
                        color={isDark ? '#9ca3af' : '#6b7280'}
                      />
                      <Text
                        className={`ml-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getRoleName(user.role_id)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      onPress={() => handleEditUser(user)}
                      className="mr-2 rounded-lg bg-blue-100 p-2">
                      <Feather name="edit-2" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(user)}
                      className="rounded-lg bg-red-100 p-2">
                      <MaterialIcons name="delete" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

          {!loading && !error && users.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <MaterialIcons name="people" size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
              <Text
                className={`mt-4 text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No hay usuarios registrados
              </Text>
              <Text className={`mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Crea el primer usuario usando el botón &quot;Nuevo&quot;
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Navigation Bar - Fixed at bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: -30,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom,
        }}>
        <BottomNavBar theme={theme} />
      </View>

      {/* Modal para crear/editar usuario */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Modal Header */}
          <View className={`px-6 py-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row items-center justify-between">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-6 py-4">
            <View className="space-y-4">
              {/* Nombre */}
              <View>
                <Text
                  className={`mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre completo *
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="Ingresa el nombre completo"
                  className={`rounded-lg border px-4 py-3 ${
                    isDark
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>

              {/* Email */}
              <View>
                <Text
                  className={`mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Correo electrónico *
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  placeholder="ejemplo@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`rounded-lg border px-4 py-3 ${
                    isDark
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>

              {/* Contraseña */}
              <View>
                <Text
                  className={`mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contraseña {editingUser ? '(opcional)' : '*'}
                </Text>
                <TextInput
                  value={formData.password}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
                  placeholder={
                    editingUser ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'
                  }
                  secureTextEntry
                  className={`rounded-lg border px-4 py-3 ${
                    isDark
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>

              {/* Rol */}
              <View>
                <Text
                  className={`mb-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rol *
                </Text>
                <View className="space-y-2">
                  {ROLES.map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      onPress={() => setFormData((prev) => ({ ...prev, role_id: role.id }))}
                      className={`flex-row items-center rounded-lg border p-3 ${
                        formData.role_id === role.id
                          ? 'border-blue-500 bg-blue-50'
                          : isDark
                            ? 'border-gray-600 bg-gray-800'
                            : 'border-gray-300 bg-white'
                      }`}>
                      <View
                        className={`mr-3 h-4 w-4 rounded-full border-2 ${
                          formData.role_id === role.id
                            ? 'border-blue-500 bg-blue-500'
                            : isDark
                              ? 'border-gray-400'
                              : 'border-gray-300'
                        }`}>
                        {formData.role_id === role.id && (
                          <View className="mt-0.5 h-2 w-2 self-center rounded-full bg-white" />
                        )}
                      </View>
                      <Text
                        className={`font-medium ${
                          formData.role_id === role.id
                            ? 'text-blue-700'
                            : isDark
                              ? 'text-white'
                              : 'text-gray-900'
                        }`}>
                        {role.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View className="mt-6 flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className={`flex-1 rounded-lg border py-3 ${
                  isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
                }`}>
                <Text
                  className={`text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateUser}
                disabled={loading}
                className={`flex-1 rounded-lg py-3 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center font-medium text-white">
                    {editingUser ? 'Actualizar' : 'Crear Usuario'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default UsersScreen;
