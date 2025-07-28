import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../services/messageService';
import { relationService } from '../services/relationService';
import { childMessageService } from '../services/childMessageService';
import { categoryService } from '../services/categoryService';
import { Message, RelationResponse, ChildMessage, Category, CreateMessageDTO } from '../types/api';
import { Picker } from '@react-native-picker/picker';
import {
  MessageSquare,
  Users,
  Plus,
  X,
  Check,
  User,
  Calendar,
  Heart,
  Search,
  Send,
  Eye,
  Trash2,
} from 'lucide-react-native';

const TutorMessageManagementScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  // Estados principales
  const [children, setChildren] = useState<RelationResponse[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<ChildMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para modales y formularios
  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<RelationResponse | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'messages' | 'assignments'>('assignments');
  
  // Estado para crear mensaje
  const [newMessage, setNewMessage] = useState({
    text: '',
    category_id: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [childrenData, messagesData, categoriesData] = await Promise.all([
        relationService.getMyChildren(),
        messageService.getAllMessages(),
        categoryService.getAllCategories(),
      ]);
      
      setChildren(childrenData);
      setMessages(messagesData);
      setCategories(categoriesData);
      
      // Cargar asignaciones para todos los niños
      await loadAllAssignments(childrenData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllAssignments = async (childrenData: RelationResponse[]) => {
    try {
      const allAssignments: ChildMessage[] = [];
      for (const relation of childrenData) {
        try {
          console.log('🔍 Loading assignments for child:', relation.child);
          console.log('🔍 Child ID:', relation.child.id);
          const childAssignments = await childMessageService.getChildMessages(relation.child.id);
          console.log('✅ Assignments loaded for child', relation.child.id, ':', childAssignments.length);
          allAssignments.push(...childAssignments);
        } catch (error) {
          console.warn(`Error loading assignments for child ${relation.child.id}:`, error);
        }
      }
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, [loadInitialData]);

  const createMessage = async () => {
    if (!newMessage.text.trim()) {
      Alert.alert('Error', 'Por favor ingresa el texto del mensaje');
      return;
    }

    if (!newMessage.category_id) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    try {
      const messageData: CreateMessageDTO = {
        text: newMessage.text.trim(),
        category_id: parseInt(newMessage.category_id),
      };

      await messageService.createMessage(messageData);
      
      Alert.alert('Éxito', 'Mensaje creado exitosamente');
      setShowCreateMessageModal(false);
      setNewMessage({ text: '', category_id: '' });
      
      // Recargar mensajes
      const updatedMessages = await messageService.getAllMessages();
      setMessages(updatedMessages);
    } catch (error: any) {
      console.error('Error creating message:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el mensaje');
    }
  };

  const assignMessageToChild = async (childId: number, messageId: number) => {
    try {
      console.log('🔄 Assigning message', messageId, 'to child', childId);
      await childMessageService.assignMessage({
        child_id: childId,
        message_id: messageId,
      });
      
      Alert.alert('Éxito', 'Mensaje asignado exitosamente');
      
      // Recargar asignaciones
      await loadAllAssignments(children);
    } catch (error: any) {
      console.error('Error assigning message:', error);
      
      let errorMessage = 'No se pudo asignar el mensaje';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const removeAssignment = async (childId: number, messageId: number) => {
    try {
      await childMessageService.removeMessageAssignment(childId, messageId);
      Alert.alert('Éxito', 'Asignación eliminada exitosamente');
      
      // Recargar asignaciones
      await loadAllAssignments(children);
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar la asignación');
    }
  };

  const openAssignModal = (child: RelationResponse) => {
    setSelectedChild(child);
    setShowAssignModal(true);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.text.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || message.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getChildAssignments = (childId: number) => {
    const childAssignments = assignments.filter(assignment => assignment.child_id === childId);
    console.log(`📊 Child ${childId} has ${childAssignments.length} assignments`);
    return childAssignments;
  };

  const isMessageAssignedToChild = (messageId: number, childId: number) => {
    const isAssigned = assignments.some(assignment => 
      assignment.message_id === messageId && assignment.child_id === childId
    );
    console.log(`🔍 Checking assignment: message ${messageId} to child ${childId} = ${isAssigned}`);
    console.log(`📊 Total assignments: ${assignments.length}`);
    return isAssigned;
  };

  const renderChildCard = ({ item: relation }: { item: RelationResponse }) => (
    <View style={{
      backgroundColor: isDark ? '#374151' : '#f9fafb',
      padding: 16,
      margin: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            backgroundColor: isDark ? '#6366f1' : '#8b5cf6',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <User size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? '#f9fafb' : '#111827',
              marginBottom: 4,
            }}>
              {relation.child.name}
            </Text>
            <Text style={{
              fontSize: 14,
              color: isDark ? '#9ca3af' : '#6b7280',
            }}>
              {relation.child.email}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => openAssignModal(relation)}
          style={{
            backgroundColor: isDark ? '#059669' : '#10b981',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Plus size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>
            Asignar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mostrar mensajes asignados */}
      <View>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: 8,
        }}>
          Mensajes asignados ({getChildAssignments(relation.child.id).length})
        </Text>
        {getChildAssignments(relation.child.id).slice(0, 3).map((assignment) => {
          const message = messages.find(m => m.id === assignment.message_id);
          return message ? (
            <View key={assignment.id} style={{
              backgroundColor: isDark ? '#4b5563' : '#ffffff',
              padding: 8,
              borderRadius: 6,
              marginBottom: 4,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: 12,
                flex: 1,
              }} numberOfLines={1}>
                {message.text}
              </Text>
              {assignment.is_favorite && (
                <Heart size={12} color={isDark ? '#ef4444' : '#dc2626'} fill={isDark ? '#ef4444' : '#dc2626'} />
              )}
              <TouchableOpacity
                onPress={() => removeAssignment(relation.child.id, message.id)}
                style={{ marginLeft: 8 }}
              >
                <Trash2 size={12} color={isDark ? '#ef4444' : '#dc2626'} />
              </TouchableOpacity>
            </View>
          ) : null;
        })}
        {getChildAssignments(relation.child.id).length > 3 && (
          <Text style={{
            color: isDark ? '#9ca3af' : '#6b7280',
            fontSize: 12,
            fontStyle: 'italic',
          }}>
            +{getChildAssignments(relation.child.id).length - 3} más...
          </Text>
        )}
      </View>
    </View>
  );

  const renderMessageCard = ({ item: message }: { item: Message }) => (
    <View style={{
      backgroundColor: isDark ? '#374151' : '#f9fafb',
      padding: 16,
      margin: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#f9fafb' : '#111827',
            marginBottom: 8,
          }}>
            {message.text}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{
              fontSize: 12,
              color: isDark ? '#9ca3af' : '#6b7280',
            }}>
              Categoría: {categories.find(c => c.id === message.category_id)?.name || 'Sin categoría'}
            </Text>
          </View>
          <Text style={{
            fontSize: 12,
            color: isDark ? '#9ca3af' : '#6b7280',
          }}>
            Creado: {message.created_at ? new Date(message.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
          </Text>
        </View>
      </View>

      {/* Mostrar en qué niños está asignado */}
      <View>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: isDark ? '#f9fafb' : '#111827',
          marginBottom: 8,
        }}>
          Asignado a:
        </Text>
        {children.filter(child => 
          isMessageAssignedToChild(message.id, child.child.id)
        ).map((relation) => (
          <View key={relation.child.id} style={{
            backgroundColor: isDark ? '#4b5563' : '#ffffff',
            padding: 8,
            borderRadius: 6,
            marginBottom: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Text style={{
              color: isDark ? '#d1d5db' : '#374151',
              fontSize: 12,
            }}>
              {relation.child.name}
            </Text>
            <TouchableOpacity
              onPress={() => removeAssignment(relation.child.id, message.id)}
            >
              <Trash2 size={12} color={isDark ? '#ef4444' : '#dc2626'} />
            </TouchableOpacity>
          </View>
        ))}
        {children.filter(child => 
          isMessageAssignedToChild(message.id, child.child.id)
        ).length === 0 && (
          <Text style={{
            color: isDark ? '#9ca3af' : '#6b7280',
            fontSize: 12,
            fontStyle: 'italic',
          }}>
            No asignado a ningún niño
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={isDark ? '#6366f1' : '#8b5cf6'} />
        <Text style={{
          color: isDark ? '#f9fafb' : '#111827',
          marginTop: 16,
          fontSize: 16,
        }}>
          Cargando datos...
        </Text>
      </View>
    );
  }

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
          Gestión de Mensajes
        </Text>
        <Text style={{
          fontSize: 14,
          color: isDark ? '#9ca3af' : '#6b7280',
          textAlign: 'center',
          marginTop: 4,
        }}>
          Asigna mensajes a tus niños
        </Text>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        margin: 16,
        borderRadius: 8,
        padding: 4,
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('assignments')}
          style={{
            flex: 1,
            paddingVertical: 12,
            backgroundColor: activeTab === 'assignments' ? (isDark ? '#6366f1' : '#8b5cf6') : 'transparent',
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: activeTab === 'assignments' ? 'white' : (isDark ? '#9ca3af' : '#6b7280'),
            fontWeight: '600',
          }}>
            Mis Niños
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('messages')}
          style={{
            flex: 1,
            paddingVertical: 12,
            backgroundColor: activeTab === 'messages' ? (isDark ? '#6366f1' : '#8b5cf6') : 'transparent',
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: activeTab === 'messages' ? 'white' : (isDark ? '#9ca3af' : '#6b7280'),
            fontWeight: '600',
          }}>
            Todos los Mensajes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Message Button */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setShowCreateMessageModal(true)}
          style={{
            backgroundColor: isDark ? '#059669' : '#10b981',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={20} color="white" />
          <Text style={{
            color: 'white',
            fontWeight: '600',
            marginLeft: 8,
          }}>
            Crear Nuevo Mensaje
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'assignments' ? (
        <FlatList
          data={children}
          renderItem={renderChildCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[isDark ? '#6366f1' : '#8b5cf6']}
            />
          }
          ListEmptyComponent={
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Users size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
              <Text style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 16,
                textAlign: 'center',
                marginTop: 16,
              }}>
                No tienes niños asignados
              </Text>
            </View>
          }
        />
      ) : (
        <>
          {/* Search and Filter */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
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

            {/* Category Filter */}
            <View style={{
              backgroundColor: isDark ? '#374151' : '#f9fafb',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isDark ? '#4b5563' : '#d1d5db',
            }}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={setSelectedCategory}
                style={{
                  color: isDark ? '#f9fafb' : '#111827',
                }}
              >
                <Picker.Item label="Todas las categorías" value="all" />
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

          <FlatList
            data={filteredMessages}
            renderItem={renderMessageCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[isDark ? '#6366f1' : '#8b5cf6']}
              />
            }
            ListEmptyComponent={
              <View style={{ padding: 32, alignItems: 'center' }}>
                <MessageSquare size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
                <Text style={{
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: 16,
                  textAlign: 'center',
                  marginTop: 16,
                }}>
                  No hay mensajes disponibles
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* Create Message Modal */}
      <Modal
        visible={showCreateMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateMessageModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: isDark ? '#374151' : '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 400,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: isDark ? '#f9fafb' : '#111827',
              }}>
                Crear Nuevo Mensaje
              </Text>
              <TouchableOpacity onPress={() => setShowCreateMessageModal(false)}>
                <X size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? '#f9fafb' : '#111827',
                marginBottom: 8,
              }}>
                Texto del mensaje *
              </Text>
              <TextInput
                value={newMessage.text}
                onChangeText={(text) => setNewMessage(prev => ({ ...prev, text }))}
                placeholder="Escribe el mensaje aquí..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: isDark ? '#4b5563' : '#f9fafb',
                  borderRadius: 8,
                  padding: 12,
                  color: isDark ? '#f9fafb' : '#111827',
                  fontSize: 16,
                  marginBottom: 16,
                  textAlignVertical: 'top',
                }}
              />

              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? '#f9fafb' : '#111827',
                marginBottom: 8,
              }}>
                Categoría *
              </Text>
              <View style={{
                backgroundColor: isDark ? '#4b5563' : '#f9fafb',
                borderRadius: 8,
                marginBottom: 24,
              }}>
                <Picker
                  selectedValue={newMessage.category_id}
                  onValueChange={(value) => setNewMessage(prev => ({ ...prev, category_id: value }))}
                  style={{
                    color: isDark ? '#f9fafb' : '#111827',
                  }}
                >
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
            </ScrollView>

            <View style={{
              flexDirection: 'row',
              gap: 12,
            }}>
              <TouchableOpacity
                onPress={() => setShowCreateMessageModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: isDark ? '#d1d5db' : '#374151',
                  fontWeight: '600',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createMessage}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#6366f1' : '#8b5cf6',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                }}>
                  Crear Mensaje
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Message Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: isDark ? '#374151' : '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: isDark ? '#f9fafb' : '#111827',
              }}>
                Asignar Mensaje
              </Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <X size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            {selectedChild && (
              <Text style={{
                fontSize: 16,
                color: isDark ? '#d1d5db' : '#374151',
                marginBottom: 16,
              }}>
                Asignar mensaje para: {selectedChild.child.name}
              </Text>
            )}

            <ScrollView style={{ maxHeight: 400 }}>
              {filteredMessages.map((message) => {
                const isAssigned = selectedChild ? isMessageAssignedToChild(message.id, selectedChild.child.id) : false;
                return (
                  <TouchableOpacity
                    key={message.id}
                    onPress={() => {
                      if (selectedChild && !isAssigned) {
                        assignMessageToChild(selectedChild.child.id, message.id);
                        setShowAssignModal(false);
                      }
                    }}
                    disabled={isAssigned}
                    style={{
                      backgroundColor: isAssigned 
                        ? (isDark ? '#4b5563' : '#f3f4f6')
                        : (isDark ? '#1f2937' : '#f9fafb'),
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isAssigned 
                        ? (isDark ? '#6b7280' : '#d1d5db')
                        : (isDark ? '#374151' : '#e5e7eb'),
                      opacity: isAssigned ? 0.6 : 1,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: isDark ? '#f9fafb' : '#111827',
                          fontSize: 14,
                          fontWeight: '500',
                          marginBottom: 4,
                        }}>
                          {message.text}
                        </Text>
                        <Text style={{
                          color: isDark ? '#9ca3af' : '#6b7280',
                          fontSize: 12,
                        }}>
                          {categories.find(c => c.id === message.category_id)?.name || 'Sin categoría'}
                        </Text>
                      </View>
                      {isAssigned && (
                        <Check size={20} color={isDark ? '#10b981' : '#059669'} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowAssignModal(false)}
              style={{
                backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text style={{
                color: isDark ? '#d1d5db' : '#374151',
                fontWeight: '600',
              }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar theme={theme} />
    </View>
  );
};

export default TutorMessageManagementScreen;
