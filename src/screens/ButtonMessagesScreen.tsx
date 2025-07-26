import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useESP32WebSocketStore } from '../stores/esp32WebSocketStore';
import { messagesService, Message } from '../services/messagesService';
import { authService } from '../services/authService';
import { API_BASE_URL, SERVER_IP, API_PORT, ESP32_MAX_BUTTONS } from '../config/env';
import { ESP32_FILE_MAPPING } from '../config/constants';

interface ButtonConfig {
  buttonNumber: number;
  messageId: number | null;
  messageText: string;
  messageCategory: string;
  esp32AudioFile: string;
  isActive: boolean;
}

export default function ButtonMessagesScreen() {
  const { sendCommand, status, configureButtonWithAudio, audioTransferProgress } = useESP32WebSocketStore();
  const [buttonConfigs, setButtonConfigs] = useState<ButtonConfig[]>([]);
  const [availableMessages, setAvailableMessages] = useState<Message[]>([]);
  const [messagesGrouped, setMessagesGrouped] = useState<{ [categoryName: string]: Message[] }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Saludos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mensajes del backend
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting to load messages...');
      
      const [messages, grouped] = await Promise.all([
        messagesService.getActiveMessages(),
        messagesService.getMessagesGroupedByCategory()
      ]);
      
      console.log('✅ Messages loaded successfully:', messages.length);
      
      setAvailableMessages(messages);
      setMessagesGrouped(grouped);
      
      // Inicializar configuraciones de botones vacías
      initializeButtonConfigs();
      
    } catch (err: any) {
      console.error('❌ Error loading messages:', err);
      const errorMessage = err.message || 'Error al cargar mensajes del servidor';
      setError(errorMessage);
      
      // Usar datos de ejemplo si falla la carga
      setAvailableMessages([]);
      setMessagesGrouped({});
      initializeButtonConfigs();
    } finally {
      setLoading(false);
    }
  };

  // Función para probar conectividad básica
  const testConnectivity = async () => {
    try {
      setError(null);
      console.log('🧪 Test conectividad...');
      
      // Test 1: Conectividad básica
      const basicResponse = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📡 Status:', basicResponse.status);
      
      // Test 2: Verificar token de autenticación
      const token = await authService.getToken();
      console.log('🔑 Token check:', token ? 'Present' : 'Missing');
      
      if (!token) {
        Alert.alert(
          '⚠️ Problema de autenticación',
          'No hay token de autenticación. Inicia sesión nuevamente.'
        );
        return;
      }
      
      // Test 3: Probar endpoint específico
      const apiResponse = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('🎯 API response status:', apiResponse.status);
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        Alert.alert(
          '✅ Conectividad OK', 
          `Servidor accesible y API funcionando.\nMensajes encontrados: ${result.data?.length || 0}`
        );
      } else {
        const errorText = await apiResponse.text();
        Alert.alert(
          '⚠️ Problema con API', 
          `Status: ${apiResponse.status}\nError: ${errorText}`
        );
      }
    } catch (error: any) {
      console.error('❌ Connectivity test failed:', error);
      
      let diagnosticMessage = 'No se puede acceder al servidor:\n\n';
      
      if (error.message?.includes('Network request failed')) {
        diagnosticMessage += `• Verifica que el backend esté ejecutándose en el puerto ${API_PORT}\n`;
        diagnosticMessage += '• Confirma que tu dispositivo esté en la misma red WiFi\n';
        diagnosticMessage += `• Verifica que la IP ${SERVER_IP} sea correcta\n`;
        diagnosticMessage += `• Intenta acceder desde un navegador: ${API_BASE_URL}`;
      } else {
        diagnosticMessage += error.message;
      }
      
      Alert.alert('❌ Error de conectividad', diagnosticMessage);
    }
  };

  const initializeButtonConfigs = () => {
    const configs: ButtonConfig[] = [];
    for (let i = 1; i <= ESP32_MAX_BUTTONS; i++) {
      configs.push({
        buttonNumber: i,
        messageId: null,
        messageText: 'Sin asignar',
        messageCategory: '',
        esp32AudioFile: '',
        isActive: false,
      });
    }
    setButtonConfigs(configs);
  };

  // Mapear mensaje a archivo ESP32 según categoría
  const getESP32AudioFile = (message: Message, buttonNumber: number): string => {
    const categoryMapping: { [key: string]: number } = {
      'Saludos': 1,
      'Básico': 1,
      'Emociones': 2,
      'Necesidades': 3
    };

    const categoryId = categoryMapping[message.category_name] || 1;
    const fileGroup = ESP32_FILE_MAPPING[categoryId as keyof typeof ESP32_FILE_MAPPING];
    
    if (fileGroup && fileGroup.files[buttonNumber - 1]) {
      return fileGroup.files[buttonNumber - 1];
    }
    
    // Fallback: usar numeración secuencial
    const fileNumber = ((categoryId - 1) * 3) + buttonNumber;
    return `${fileNumber.toString().padStart(3, '0')}.wav`;
  };

  const handleSaveButtonConfig = async (messageId: number | null) => {
    if (!editingButton) return;

    const selectedMessage = availableMessages.find(msg => msg.id === messageId);
    
    // Actualizar UI inmediatamente
    setButtonConfigs(prev => prev.map(config => 
      config.buttonNumber === editingButton.buttonNumber 
        ? {
            ...config,
            messageId,
            messageText: selectedMessage?.text || 'Sin asignar',
            messageCategory: selectedMessage?.category_name || '',
            esp32AudioFile: selectedMessage ? getESP32AudioFile(selectedMessage, editingButton.buttonNumber) : '',
            isActive: messageId !== null,
          }
        : config
    ));

    // Si hay mensaje seleccionado y ESP32 conectado, transferir audio
    if (status.connected && selectedMessage) {
      try {
        setLoading(true);
        setError(null);
        
        const esp32File = getESP32AudioFile(selectedMessage, editingButton.buttonNumber);
        console.log(`🎵 Transferring audio for button ${editingButton.buttonNumber}:`, selectedMessage.text);
        
        // Preparar datos de audio para transferencia
        const audioData = await messagesService.prepareAudioForESP32(selectedMessage, esp32File);
        
        // Transferir archivo y configurar botón
        await configureButtonWithAudio(editingButton.buttonNumber, audioData);
        
        Alert.alert(
          '✅ Configuración exitosa',
          `Botón ${editingButton.buttonNumber} configurado con:\n"${selectedMessage.text}"\n\nEl archivo de audio se descargó a la microSD del ESP32.`
        );
        
      } catch (error: any) {
        console.error('❌ Error configuring button with audio:', error);
        setError(`Error al configurar botón: ${error.message}`);
        
        Alert.alert(
          '❌ Error de configuración',
          `No se pudo configurar el botón:\n${error.message}\n\nEl botón se configuró localmente pero el audio no se transfirió al ESP32.`
        );
      } finally {
        setLoading(false);
      }
    } else if (!status.connected && selectedMessage) {
      // ESP32 no conectado - solo configuración local
      Alert.alert(
        '⚠️ ESP32 Desconectado',
        'El botón se configuró localmente. Conecta el ESP32 para transferir el archivo de audio a la microSD.'
      );
    }

    setModalVisible(false);
    setEditingButton(null);
  };

  const testButton = (buttonNumber: number) => {
    if (!status.connected) {
      Alert.alert('Error', 'ESP32 no está conectado');
      return;
    }

    sendCommand({
      type: 'play_audio',
      button: buttonNumber,
    });

    Alert.alert('Prueba', `Reproduciendo audio del botón ${buttonNumber}`);
  };

  const openConfigModal = (buttonConfig: ButtonConfig) => {
    setEditingButton(buttonConfig);
    setModalVisible(true);
  };

  const unassignButton = (buttonNumber: number) => {
    Alert.alert(
      'Desasignar botón',
      `¿Quieres desasignar el botón ${buttonNumber}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Desasignar', 
          onPress: () => {
            setButtonConfigs(prev => prev.map(config => 
              config.buttonNumber === buttonNumber 
                ? {
                    ...config,
                    messageId: null,
                    messageText: 'Sin asignar',
                    messageCategory: '',
                    esp32AudioFile: '',
                    isActive: false,
                  }
                : config
            ));

            // Enviar comando de desasignación al ESP32
            if (status.connected) {
              sendCommand({
                type: 'configure_button',
                button: buttonNumber,
                audioFile: '',
                messageId: null,
              });
            }
          }
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
          Configuración de Botones ESP32
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Hardware: {ESP32_MAX_BUTTONS} botones físicos | Archivos: .wav numerados
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          Estado ESP32: {status.connected ? '🟢 Conectado' : '🔴 Desconectado'}
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 12, 
          marginBottom: 20,
          alignItems: 'center'
        }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 12, color: '#666' }}>Cargando mensajes del servidor...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={{ 
          backgroundColor: '#FFEBEE', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#F44336'
        }}>
          <Text style={{ color: '#C62828', fontWeight: '600', marginBottom: 4 }}>
            ⚠️ Error de Conexión
          </Text>
          <Text style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
            {error}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={testConnectivity}
              style={{ 
                backgroundColor: '#FF9800', 
                padding: 8, 
                borderRadius: 6, 
                flex: 1,
                marginRight: 8
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                🧪 Test Conectividad
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={loadMessages}
              style={{ 
                backgroundColor: '#F44336', 
                padding: 8, 
                borderRadius: 6, 
                flex: 1
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                🔄 Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Audio Transfer Progress */}
      {Object.keys(audioTransferProgress).length > 0 && (
        <View style={{ 
          backgroundColor: '#E8F5E8', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#4CAF50'
        }}>
          <Text style={{ color: '#2E7D32', fontWeight: '600', marginBottom: 8 }}>
            🎵 Transferencia de Audio
          </Text>
          {Object.entries(audioTransferProgress).map(([filename, progress]) => (
            <View key={filename} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                {filename}: {progress}%
              </Text>
              <View style={{ 
                height: 4, 
                backgroundColor: '#E0E0E0', 
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  backgroundColor: progress === 100 ? '#4CAF50' : '#2196F3',
                  borderRadius: 2
                }} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Información del hardware */}
      <View style={{ 
        backgroundColor: '#E3F2FD', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 20
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1976D2', marginBottom: 8 }}>
          ℹ️ Configuración de Hardware
        </Text>
        <Text style={{ fontSize: 12, color: '#333', lineHeight: 16 }}>
          • <Text style={{ fontWeight: '600' }}>3 botones activos:</Text> Reproducen mensajes según categoría{'\n'}
          • <Text style={{ fontWeight: '600' }}>Botón 4:</Text> Control del sistema (info/encendido){'\n'}
          • <Text style={{ fontWeight: '600' }}>Archivos:</Text> 001.wav-009.wav mapeados automáticamente{'\n'}
          • <Text style={{ fontWeight: '600' }}>Categorías:</Text> Saludos (1-3), Emociones (4-6), Necesidades (7-9)
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {buttonConfigs.map(config => (
          <View
            key={config.buttonNumber}
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
              borderLeftWidth: 4,
              borderLeftColor: config.isActive ? '#4CAF50' : '#E0E0E0',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 }}>
                  Botón {config.buttonNumber}
                </Text>
                <Text style={{ fontSize: 16, color: config.isActive ? '#333' : '#999', marginBottom: 2 }}>
                  {config.messageText}
                </Text>
                {config.isActive && (
                  <>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                      📁 {config.messageCategory}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>
                      🎵 {config.esp32AudioFile}
                    </Text>
                  </>
                )}
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {config.isActive && (
                  <TouchableOpacity
                    onPress={() => testButton(config.buttonNumber)}
                    style={{ 
                      backgroundColor: '#4CAF50', 
                      padding: 8, 
                      borderRadius: 6, 
                      marginRight: 8,
                      opacity: status.connected ? 1 : 0.5,
                    }}
                    disabled={!status.connected}
                  >
                    <MaterialIcons name="play-arrow" size={20} color="white" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={() => openConfigModal(config)}
                  style={{ backgroundColor: '#2196F3', padding: 8, borderRadius: 6, marginRight: 8 }}
                >
                  <MaterialIcons name="settings" size={20} color="white" />
                </TouchableOpacity>
                
                {config.isActive && (
                  <TouchableOpacity
                    onPress={() => unassignButton(config.buttonNumber)}
                    style={{ backgroundColor: '#F44336', padding: 8, borderRadius: 6 }}
                  >
                    <MaterialIcons name="clear" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal para configurar botón */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '95%', maxWidth: 450, maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
              Configurar Botón {editingButton?.buttonNumber}
            </Text>
            
            {/* Filtro por categoría */}
            <Text style={{ fontSize: 14, marginBottom: 8, color: '#333', fontWeight: '600' }}>
              Filtrar por categoría:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: 'row' }}>
                {Object.keys(messagesGrouped).map(categoryName => (
                  <TouchableOpacity
                    key={categoryName}
                    onPress={() => setSelectedCategory(categoryName)}
                    style={{
                      backgroundColor: selectedCategory === categoryName ? '#2196F3' : '#E0E0E0',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 15,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{
                      color: selectedCategory === categoryName ? 'white' : '#333',
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      {categoryName} ({messagesGrouped[categoryName]?.length || 0})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <Text style={{ fontSize: 16, marginBottom: 10, color: '#333' }}>
              Selecciona un mensaje:
            </Text>
            
            <ScrollView style={{ maxHeight: 250, marginBottom: 20 }}>
              {/* Opción para desasignar */}
              <TouchableOpacity
                onPress={() => handleSaveButtonConfig(null)}
                style={{ 
                  padding: 12, 
                  borderWidth: 1, 
                  borderColor: '#ddd', 
                  borderRadius: 8, 
                  marginBottom: 8,
                  backgroundColor: editingButton?.messageId === null ? '#FFEBEE' : 'white'
                }}
              >
                <Text style={{ fontWeight: '600', marginBottom: 2, color: '#F44336' }}>❌ Sin asignar</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Desasignar mensaje del botón
                </Text>
              </TouchableOpacity>

              {/* Mensajes de la categoría seleccionada */}
              {messagesGrouped[selectedCategory]?.map(message => (
                <TouchableOpacity
                  key={message.id}
                  onPress={() => handleSaveButtonConfig(message.id)}
                  style={{ 
                    padding: 12, 
                    borderWidth: 1, 
                    borderColor: '#ddd', 
                    borderRadius: 8, 
                    marginBottom: 8,
                    backgroundColor: editingButton?.messageId === message.id ? '#E3F2FD' : 'white'
                  }}
                >
                  <Text style={{ fontWeight: '600', marginBottom: 2 }} numberOfLines={2}>
                    {message.text}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    📁 {message.category_name} | 🎵 {getESP32AudioFile(message, editingButton?.buttonNumber || 1)}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    Por: {message.creator_name}
                  </Text>
                </TouchableOpacity>
              )) || (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', fontStyle: 'italic' }}>
                    No hay mensajes en la categoría "{selectedCategory}"
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ 
                  backgroundColor: '#E0E0E0', 
                  padding: 12, 
                  borderRadius: 8, 
                  flex: 1, 
                  marginRight: 8 
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '600', color: '#333' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={loadMessages}
                style={{ 
                  backgroundColor: '#4CAF50', 
                  padding: 12, 
                  borderRadius: 8, 
                  flex: 1 
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '600', color: 'white' }}>🔄 Recargar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
