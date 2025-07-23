import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';

interface Message {
    id: string;
    text: string;
    category: string;
    audioUrl?: string;
    assignedChildren: string[];
    createdAt: string;
    isActive: boolean;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

const MessageManagementPC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { user } = useAuthStore();
    const { screenWidth } = useDeviceType();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        text: '',
        category: '',
        assignedChildren: [] as string[],
    });

    // Datos simulados
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        
        // Simular carga de datos
        setTimeout(() => {
            setCategories([
                { id: '1', name: 'Saludos', color: 'bg-blue-500' },
                { id: '2', name: 'Necesidades', color: 'bg-orange-500' },
                { id: '3', name: 'Emociones', color: 'bg-purple-500' },
                { id: '4', name: 'Cortesía', color: 'bg-green-500' },
            ]);
            
            setMessages([
                {
                    id: '1',
                    text: 'Hola, ¿cómo estás?',
                    category: 'Saludos',
                    assignedChildren: ['Ana', 'Carlos'],
                    createdAt: '2025-01-15',
                    isActive: true,
                },
                {
                    id: '2',
                    text: 'Tengo hambre',
                    category: 'Necesidades',
                    assignedChildren: ['Ana', 'Luis', 'María'],
                    createdAt: '2025-01-14',
                    isActive: true,
                },
                {
                    id: '3',
                    text: 'Estoy feliz',
                    category: 'Emociones',
                    assignedChildren: ['Carlos'],
                    createdAt: '2025-01-13',
                    isActive: true,
                },
            ]);
            setLoading(false);
        }, 1000);
    };

    const handleCreateMessage = async () => {
        if (!formData.text.trim()) {
            Alert.alert('Error', 'El texto del mensaje es requerido');
            return;
        }

        if (!formData.category) {
            Alert.alert('Error', 'Selecciona una categoría');
            return;
        }

        setLoading(true);
        
        // Simular creación
        setTimeout(() => {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: formData.text,
                category: formData.category,
                assignedChildren: formData.assignedChildren,
                createdAt: new Date().toISOString().split('T')[0],
                isActive: true,
            };
            
            setMessages(prev => [newMessage, ...prev]);
            setFormData({ text: '', category: '', assignedChildren: [] });
            setShowCreateModal(false);
            setLoading(false);
            
            Alert.alert('Éxito', 'Mensaje creado correctamente');
        }, 1000);
    };

    const handleDeleteMessage = (id: string) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que quieres eliminar este mensaje?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => {
                        setMessages(prev => prev.filter(msg => msg.id !== id));
                    }
                },
            ]
        );
    };

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.text.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderMessageCard = ({ item }: { item: Message }) => (
        <View className={`rounded-xl p-6 mb-4 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                    <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        "{item.text}"
                    </Text>
                    <View className="flex-row items-center mb-2">
                        <Text style={{ fontSize: 16, color: isDark ? '#9ca3af' : '#6b7280' }}>🏷️</Text>
                        <Text className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.category}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text style={{ fontSize: 16, color: isDark ? '#9ca3af' : '#6b7280' }}>👥</Text>
                        <Text className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.assignedChildren.length} niños asignados
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row space-x-2">
                    <TouchableOpacity 
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900"
                        onPress={() => Alert.alert('Reproducir', `Reproduciendo: "${item.text}"`)}
                    >
                        <Text style={{ fontSize: 20, color: "#3b82f6" }}>▶️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                        onPress={() => Alert.alert('Editar', 'Función de edición próximamente')}
                    >
                        <Text style={{ fontSize: 20, color: isDark ? '#9ca3af' : '#6b7280' }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900"
                        onPress={() => handleDeleteMessage(item.id)}
                    >
                        <Text style={{ fontSize: 20, color: "#ef4444" }}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {item.assignedChildren.length > 0 && (
                <View>
                    <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Asignado a:
                    </Text>
                    <View className="flex-row flex-wrap">
                        {item.assignedChildren.map((child, index) => (
                            <View 
                                key={index}
                                className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full mr-2 mb-2"
                            >
                                <Text className="text-blue-800 dark:text-blue-200 text-sm">{child}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );

    const CreateMessageModal = () => (
        <Modal
            visible={showCreateModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCreateModal(false)}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-6">
                <View 
                    className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{ maxWidth: Math.min(screenWidth * 0.9, 500) }}
                >
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Crear Mensaje
                        </Text>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Text style={{ fontSize: 24, color: isDark ? '#9ca3af' : '#6b7280' }}>❌</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Texto del mensaje
                        </Text>
                        <TextInput
                            value={formData.text}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, text }))}
                            placeholder="Escribe el mensaje aquí..."
                            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                            multiline
                            numberOfLines={3}
                            className={`p-4 rounded-xl border-2 ${
                                isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-300 text-black'
                            }`}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Categoría
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row space-x-2">
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        onPress={() => setFormData(prev => ({ ...prev, category: category.name }))}
                                        className={`px-4 py-2 rounded-xl border-2 ${
                                            formData.category === category.name
                                                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                                                : isDark
                                                    ? 'border-gray-600 bg-gray-700'
                                                    : 'border-gray-300 bg-gray-50'
                                        }`}
                                    >
                                        <Text className={`${
                                            formData.category === category.name
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            onPress={() => setShowCreateModal(false)}
                            className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600"
                        >
                            <Text className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleCreateMessage}
                            disabled={loading || !formData.text.trim() || !formData.category}
                            className={`flex-1 py-3 rounded-xl ${
                                loading || !formData.text.trim() || !formData.category
                                    ? 'bg-gray-400'
                                    : 'bg-blue-600'
                            }`}
                        >
                            <Text className="text-center text-white font-semibold">
                                {loading ? 'Creando...' : 'Crear Mensaje'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <View className="p-6 border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Gestión de Mensajes
                        </Text>
                        <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tutor: {user?.name || 'Usuario'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowCreateModal(true)}
                        className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center"
                    >
                        <Text style={{ fontSize: 20, color: "#fff" }}>➕</Text>
                        <Text className="text-white font-semibold ml-2">Crear Mensaje</Text>
                    </TouchableOpacity>
                </View>

                {/* Filtros y búsqueda */}
                <View className="flex-row space-x-4">
                    <View className="flex-1">
                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Buscar mensajes..."
                            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                            className={`px-4 py-3 rounded-xl border ${
                                isDark 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-black'
                            }`}
                        />
                    </View>
                    <TouchableOpacity className={`px-4 py-3 rounded-xl border ${
                        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                    }`}>
                        <Text style={{ fontSize: 20, color: isDark ? '#9ca3af' : '#6b7280' }}>🔍</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Lista de mensajes */}
            <ScrollView className="flex-1 p-6">
                {loading ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Cargando mensajes...
                        </Text>
                    </View>
                ) : filteredMessages.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text style={{ fontSize: 64, color: isDark ? '#4b5563' : '#d1d5db' }}>💬</Text>
                        <Text className={`text-xl font-semibold mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            No hay mensajes
                        </Text>
                        <Text className={`text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {searchText ? 'No se encontraron mensajes con ese criterio' : 'Crea tu primer mensaje para comenzar'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredMessages}
                        renderItem={renderMessageCard}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>

            <CreateMessageModal />
        </View>
    );
};

export default MessageManagementPC;
