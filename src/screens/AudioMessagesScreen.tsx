import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

interface AudioMessage {
  id: number;
  filename: string;
  title: string;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export default function AudioMessagesScreen() {
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AudioMessage | null>(null);
  const [newMessage, setNewMessage] = useState({
    title: '',
    category: '',
    filename: '',
  });

  // Datos de ejemplo
  useEffect(() => {
    setMessages([
      {
        id: 1,
        filename: '001.mp3',
        title: 'Mensaje de bienvenida',
        duration: 15,
        category: 'Saludos',
        isActive: true,
        createdAt: '2024-01-15',
      },
      {
        id: 2,
        filename: '002.mp3',
        title: 'Instrucciones de uso',
        duration: 30,
        category: 'Instrucciones',
        isActive: true,
        createdAt: '2024-01-16',
      },
      {
        id: 3,
        filename: '003.mp3',
        title: 'Mensaje de despedida',
        duration: 12,
        category: 'Despedidas',
        isActive: false,
        createdAt: '2024-01-17',
      },
    ]);
  }, []);

  const handleSaveMessage = () => {
    if (!newMessage.title || !newMessage.category) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (editingMessage) {
      // Editar mensaje existente
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage.id 
          ? { ...msg, ...newMessage }
          : msg
      ));
    } else {
      // Crear nuevo mensaje
      const nextId = Math.max(...messages.map(m => m.id)) + 1;
      const filename = `${String(nextId).padStart(3, '0')}.mp3`;
      
      setMessages(prev => [...prev, {
        id: nextId,
        filename,
        title: newMessage.title,
        duration: 0,
        category: newMessage.category,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      }]);
    }

    setModalVisible(false);
    setEditingMessage(null);
    setNewMessage({ title: '', category: '', filename: '' });
  };

  const handleDeleteMessage = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este mensaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => setMessages(prev => prev.filter(msg => msg.id !== id))
        },
      ]
    );
  };

  const toggleMessageActive = (id: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isActive: !msg.isActive } : msg
    ));
  };

  const openEditModal = (message: AudioMessage) => {
    setEditingMessage(message);
    setNewMessage({
      title: message.title,
      category: message.category,
      filename: message.filename,
    });
    setModalVisible(true);
  };

  const openNewModal = () => {
    setEditingMessage(null);
    setNewMessage({ title: '', category: '', filename: '' });
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
          Mensajes de Audio
        </Text>
        <TouchableOpacity
          onPress={openNewModal}
          style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={{ color: 'white', marginLeft: 4, fontWeight: '600' }}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {messages.map(message => (
          <View
            key={message.id}
            style={{
              backgroundColor: 'white',
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 }}>
                  {message.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                  📁 {message.category}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                  🎵 {message.filename}
                </Text>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  ⏱️ {message.duration}s | 📅 {message.createdAt}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => toggleMessageActive(message.id)}
                  style={{ marginRight: 8 }}
                >
                  <MaterialIcons 
                    name={message.isActive ? "toggle-on" : "toggle-off"} 
                    size={24} 
                    color={message.isActive ? "#4CAF50" : "#757575"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => openEditModal(message)}
                  style={{ marginRight: 8 }}
                >
                  <MaterialIcons name="edit" size={20} color="#2196F3" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => handleDeleteMessage(message.id)}>
                  <MaterialIcons name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal para agregar/editar mensaje */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
              {editingMessage ? 'Editar Mensaje' : 'Nuevo Mensaje'}
            </Text>
            
            <TextInput
              placeholder="Título del mensaje"
              value={newMessage.title}
              onChangeText={(text) => setNewMessage(prev => ({ ...prev, title: text }))}
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 15 }}
            />
            
            <TextInput
              placeholder="Categoría"
              value={newMessage.category}
              onChangeText={(text) => setNewMessage(prev => ({ ...prev, category: text }))}
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 20 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ backgroundColor: '#ccc', padding: 12, borderRadius: 5, flex: 1, marginRight: 10 }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveMessage}
                style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 5, flex: 1 }}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                  {editingMessage ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
