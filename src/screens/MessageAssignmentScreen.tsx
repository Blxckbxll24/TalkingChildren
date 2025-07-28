import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../services/messageService';
import { relationService } from '../services/relationService';
import { childMessageService } from '../services/childMessageService';
import { Message, RelationResponse, ChildMessage } from '../types/api';
import {
  Send,
  Users,
  MessageSquare,
  X,
  Check,
  User,
  Calendar
} from 'lucide-react-native';

const MessageAssignmentScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [children, setChildren] = useState<RelationResponse[]>([]);
  const [assignments, setAssignments] = useState<ChildMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, childrenData] = await Promise.all([
        messageService.getAllMessages(),
        relationService.getMyChildren()
      ]);
      
      setMessages(messagesData);
      setChildren(childrenData);
      
      // Obtener asignaciones para todos los niños
      const allAssignments: ChildMessage[] = [];
      for (const relation of childrenData) {
        try {
          const childAssignments = await childMessageService.getChildMessages(relation.child.id);
          allAssignments.push(...childAssignments);
        } catch (error) {
          console.warn(`Error loading assignments for child ${relation.child.id}:`, error);
        }
      }
      setAssignments(allAssignments);
      
    } catch (error) {
      
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (message: Message) => {
    setSelectedMessage(message);
    setShowAssignModal(true);
  };

  const assignMessageToChild = async (childId: number) => {
    if (!selectedMessage) return;

    try {
      console.log('🔍 Assigning message:', {
        child_id: childId,
        message_id: selectedMessage.id
      });

      await childMessageService.assignMessage({
        child_id: childId,
        message_id: selectedMessage.id
      });
      
      Alert.alert('Éxito', 'Mensaje asignado exitosamente');
      setShowAssignModal(false);
      setSelectedMessage(null);
      loadData(); // Recargar datos para actualizar la vista
    } catch (error: any) {
      console.error('❌ Error assigning message:', error);
      
      let errorMessage = 'No se pudo asignar el mensaje';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const unassignMessage = async (assignment: ChildMessage) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas quitar esta asignación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await childMessageService.removeMessageAssignment(assignment.child_id, assignment.message_id);
              Alert.alert('Éxito', 'Asignación eliminada exitosamente');
              loadData();
            } catch (error) {
              
              Alert.alert('Error', 'No se pudo eliminar la asignación');
            }
          }
        }
      ]
    );
  };

  const getAssignedChildren = (messageId: number) => {
    return assignments.filter(assignment => assignment.message_id === messageId);
  };

  const isMessageAssigned = (messageId: number, childId: number) => {
    return assignments.some(assignment => 
      assignment.message_id === messageId && assignment.child_id === childId
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const MessageItem = ({ item }: { item: Message }) => {
    const assignedChildren = getAssignedChildren(item.id);
    
    return (
      <View className={`rounded-xl p-4 mb-3 shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
              {item.text}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Categoría: {item.category_name || 'Sin categoría'}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => openAssignModal(item)}
            className="bg-blue-500 rounded-full p-2 ml-3"
          >
            <Send size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Niños asignados */}
        {assignedChildren.length > 0 && (
          <View>
            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Asignado a:
            </Text>
            <View className="flex-row flex-wrap">
              {assignedChildren.map((assignment) => {
                const child = children.find(c => c.child.id === assignment.child_id);
                return (
                  <View
                    key={assignment.id}
                    className={`flex-row items-center bg-green-100 rounded-full px-3 py-1 mr-2 mb-2 ${isDark ? 'bg-green-800' : 'bg-green-100'}`}
                  >
                    <User size={12} color={isDark ? '#10B981' : '#059669'} />
                    <Text className={`ml-1 text-xs ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                      {child?.child.name || 'Niño desconocido'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => unassignMessage(assignment)}
                      className="ml-2"
                    >
                      <X size={12} color={isDark ? '#10B981' : '#059669'} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {assignedChildren.length === 0 && (
          <Text className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No asignado a ningún niño
          </Text>
        )}
      </View>
    );
  };

  const AssignModal = () => (
    <Modal
      visible={showAssignModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAssignModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`w-11/12 max-h-96 rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Asignar Mensaje
            </Text>
            <TouchableOpacity onPress={() => setShowAssignModal(false)}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {selectedMessage && (
            <View className="mb-4">
              <Text className={`font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Mensaje:
              </Text>
              <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                "{selectedMessage.text}"
              </Text>
            </View>
          )}

          <Text className={`font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Selecciona los niños:
          </Text>

          <ScrollView className="max-h-48">
            {children.length === 0 ? (
              <Text className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No tienes niños asignados
              </Text>
            ) : (
              children.map((relation) => {
                const isAssigned = selectedMessage ? 
                  isMessageAssigned(selectedMessage.id, relation.child.id) : false;
                
                return (
                  <TouchableOpacity
                    key={relation.id}
                    onPress={() => !isAssigned ? assignMessageToChild(relation.child.id) : null}
                    disabled={isAssigned}
                    className={`flex-row items-center justify-between p-3 rounded-lg mb-2 ${
                      isAssigned 
                        ? (isDark ? 'bg-gray-700' : 'bg-gray-100')
                        : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100')
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                        <User size={16} color="#fff" />
                      </View>
                      <View>
                        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                          {relation.child.name}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {relation.child.email}
                        </Text>
                      </View>
                    </View>
                    
                    {isAssigned ? (
                      <Check size={20} color="#10B981" />
                    ) : (
                      <View className="w-5 h-5 border-2 border-gray-400 rounded" />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Cargando asignaciones...
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
          <View className="mb-6">
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              📤 Asignar Mensajes
            </Text>
            <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Asigna mensajes específicos a tus niños
            </Text>
          </View>

          {/* Stats */}
          <View className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
              Estadísticas
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {messages.length}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                  Mensajes
                </Text>
              </View>
              <View className="items-center">
                <Text className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {children.length}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-green-700'}`}>
                  Niños
                </Text>
              </View>
              <View className="items-center">
                <Text className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {assignments.length}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-purple-700'}`}>
                  Asignaciones
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <View className="px-6 pb-24">
          {messages.length === 0 ? (
            <View className="items-center py-12">
              <MessageSquare size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
              <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay mensajes disponibles
              </Text>
              <Text className={`text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Crea mensajes primero para poder asignarlos
              </Text>
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={MessageItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <AssignModal />
      <BottomNavBar theme={theme} />
    </View>
  );
};

export default MessageAssignmentScreen;
