import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useESP32StoreWithTransfer } from '../stores/esp32WebSocketStoreWithTransfer';
import { useMessageStore } from '../stores/messageStore';
import { Message } from '../types/api';
import { WEBSOCKET_URL } from '../config/env';

const ESP32_WEBSOCKET_URL = WEBSOCKET_URL;

export default function ButtonConfigWithTransferScreen() {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { 
    isConnected, 
    isConnecting, 
    esp32Status, 
    audioTransfer,
    connect, 
    disconnect,
    transferAudioToESP32,
    configureButtonWithAudio,
    playButton,
    changeCategory,
    requestStatus
  } = useESP32StoreWithTransfer();
  
  const { messages, fetchMessages, downloadAudioAsBase64 } = useMessageStore();
  
  const [selectedMessages, setSelectedMessages] = useState<{[key: number]: Message}>({});
  const [transferringButton, setTransferringButton] = useState<number | null>(null);

  useEffect(() => {
    // Load messages when component mounts
    fetchMessages();
  }, []);

  useEffect(() => {
    // NO auto-conectar automáticamente
    // El usuario debe presionar el botón "Conectar" manualmente
  }, []);

  const handleConnect = async () => {
    try {
      const success = await connect(ESP32_WEBSOCKET_URL);
      if (success) {
        // Request initial status
        setTimeout(() => requestStatus(), 1000);
      }
    } catch (error) {
      
    }
  };

  const handleDisconnect = () => {
    disconnect();
    Alert.alert('🔌 Desconectado', 'Desconectado del ESP32');
  };

  const getConnectionStatus = (): { text: string; color: string } => {
    if (isConnected) {
      return { text: '✅ Conectado', color: '#10B981' };
    } else if (isConnecting) {
      return { text: '🔄 Conectando...', color: '#F59E0B' };
    } else {
      return { text: '❌ Desconectado', color: '#EF4444' };
    }
  };

  const getESP32StatusInfo = () => {
    if (!esp32Status) return 'Sin información';
    
    const statusItems = [];
    if (esp32Status.battery !== undefined) statusItems.push(`🔋 ${esp32Status.battery}%`);
    if (esp32Status.mp3_ready !== undefined) statusItems.push(`🎵 ${esp32Status.mp3_ready ? 'MP3 OK' : 'MP3 Error'}`);
    if (esp32Status.sd_ready !== undefined) statusItems.push(`💾 ${esp32Status.sd_ready ? 'SD OK' : 'SD Error'}`);
    if (esp32Status.category !== undefined) statusItems.push(`📁 Cat. ${esp32Status.category}`);
    if (esp32Status.uptime !== undefined) statusItems.push(`⏱️ ${Math.floor(esp32Status.uptime / 60)}min`);
    
    return statusItems.join(' | ');
  };

  const selectMessageForButton = (button: number) => {
    if (messages.length === 0) {
      console.log('No hay mensajes disponibles');
      return;
    }

    const messagesList = messages.map((msg: Message, index: number) => ({
      text: `${msg.category_name}: ${msg.text}`,
      onPress: () => setSelectedMessages(prev => ({ ...prev, [button]: msg }))
    }));

    Alert.alert(
      `Seleccionar mensaje para Botón ${button}`,
      'Elige un mensaje:',
      [
        ...messagesList.slice(0, 5), // Mostrar solo primeros 5 para no saturar
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const downloadAndTransferAudio = async (button: number, message: Message) => {
    if (!isConnected) {
      console.log('ESP32 no está conectado');
      return;
    }

    if (audioTransfer.inProgress) {
      console.log('Transferencia en progreso, esperando...');
      return;
    }

    try {
      setTransferringButton(button);

      // Download audio as base64
      console.log(`🎵 Descargando audio para mensaje ${message.id}...`);
      const audioBase64 = await downloadAudioAsBase64(message.id);
      
      if (!audioBase64) {
        throw new Error('No se pudo descargar el audio');
      }

      // Generate filename
      const filename = `${String(message.id).padStart(3, '0')}.wav`;
      
      console.log(`📤 Transfiriendo ${filename} al ESP32...`);
      
      // Transfer to ESP32
      const transferSuccess = await transferAudioToESP32(
        audioBase64,
        filename,
        message.id,
        message.text,
        message.category_name
      );

      if (!transferSuccess) {
        throw new Error('No se pudo iniciar la transferencia');
      }

      // Wait for transfer completion
      await waitForTransferCompletion();

      // Configure button
      console.log(`🔘 Configurando botón ${button}...`);
      const configSuccess = configureButtonWithAudio(
        button,
        message.id,
        message.text,
        message.category_name,
        filename
      );

      if (configSuccess) {
        Alert.alert(
          '✅ Configurado', 
          `Botón ${button} configurado con:\n"${message.text}"\nArchivo: ${filename}`
        );
      } else {
        Alert.alert('⚠️ Advertencia', 'Audio transferido pero falló la configuración del botón');
      }

    } catch (error) {
      
    } finally {
      setTransferringButton(null);
    }
  };

  const waitForTransferCompletion = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const checkTransfer = () => {
        if (!audioTransfer.inProgress) {
          if (audioTransfer.error) {
            reject(new Error(audioTransfer.error));
          } else {
            resolve();
          }
          return;
        }
        setTimeout(checkTransfer, 500);
      };
      setTimeout(checkTransfer, 500);
    });
  };

  const handlePlayButton = (button: number) => {
    if (!isConnected) {
      console.log('ESP32 no está conectado');
      return;
    }

    const success = playButton(button);
    if (!success) {
      console.log('No se pudo reproducir el audio');
    }
  };

  const handleChangeCategory = () => {
    if (!isConnected) {
      console.log('ESP32 no está conectado');
      return;
    }

    Alert.alert(
      'Cambiar Categoría',
      'Selecciona una categoría:',
      [
        { text: '1. Saludos', onPress: () => changeCategory(1) },
        { text: '2. Emociones', onPress: () => changeCategory(2) },
        { text: '3. Necesidades', onPress: () => changeCategory(3) },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const renderAudioTransferStatus = () => {
    if (!audioTransfer.inProgress && !audioTransfer.error) return null;

    return (
      <View style={[styles.transferStatus, { backgroundColor: colors.card }]}>
        <Text style={[styles.transferTitle, { color: colors.text }]}>
          🎵 Transferencia de Audio
        </Text>
        
        {audioTransfer.inProgress && (
          <>
            <Text style={[styles.transferText, { color: colors.text }]}>
              Archivo: {audioTransfer.filename}
            </Text>
            <Text style={[styles.transferText, { color: colors.text }]}>
              Progreso: {audioTransfer.progress}%
            </Text>
            <ProgressBarAndroid
              styleAttr="Horizontal"
              indeterminate={false}
              progress={audioTransfer.progress / 100}
              color={colors.primary}
            />
            <Text style={[styles.transferText, { color: colors.textSecondary }]}>
              {audioTransfer.bytesTransferred} / {audioTransfer.totalBytes} bytes
            </Text>
          </>
        )}

        {audioTransfer.error && (
          <Text style={[styles.errorText, { color: colors.error || '#EF4444' }]}>
            ❌ Error: {audioTransfer.error}
          </Text>
        )}
      </View>
    );
  };

  const connectionStatus = getConnectionStatus();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            ESP32 TalkingChildren
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configuración con Transferencia de Audio
          </Text>
        </View>

        {/* Connection Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Estado de Conexión
          </Text>
          <Text style={[styles.statusText, { color: connectionStatus.color }]}>
            {connectionStatus.text}
          </Text>
          
          {esp32Status && (
            <Text style={[styles.deviceInfo, { color: colors.textSecondary }]}>
              {getESP32StatusInfo()}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isConnected ? colors.error || '#EF4444' : colors.primary }
              ]}
              onPress={isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isConnected ? '🔌 Desconectar' : '🔗 Conectar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => requestStatus()}
              disabled={!isConnected}
            >
              <Text style={styles.buttonText}>📊 Estado</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Audio Transfer Status */}
        {renderAudioTransferStatus()}

        {/* Button Configuration */}
        <View style={[styles.buttonConfigCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🔘 Configuración de Botones
          </Text>

          {[1, 2, 3].map((button) => (
            <View key={button} style={styles.buttonConfig}>
              <Text style={[styles.buttonLabel, { color: colors.text }]}>
                Botón {button}
              </Text>
              
              {selectedMessages[button] && (
                <View style={[styles.selectedMessage, { backgroundColor: colors.background }]}>
                  <Text style={[styles.messageText, { color: colors.text }]}>
                    {selectedMessages[button].category_name}: {selectedMessages[button].text}
                  </Text>
                </View>
              )}

              <View style={styles.buttonActions}>
                <TouchableOpacity
                  style={[styles.configButton, { backgroundColor: colors.primary }]}
                  onPress={() => selectMessageForButton(button)}
                  disabled={!isConnected || transferringButton === button}
                >
                  <Text style={styles.buttonText}>
                    {selectedMessages[button] ? '🔄 Cambiar' : '➕ Seleccionar'}
                  </Text>
                </TouchableOpacity>

                {selectedMessages[button] && (
                  <TouchableOpacity
                    style={[
                      styles.configButton, 
                      { 
                        backgroundColor: transferringButton === button ? '#F59E0B' : '#10B981',
                        opacity: (!isConnected || transferringButton !== null) ? 0.5 : 1
                      }
                    ]}
                    onPress={() => downloadAndTransferAudio(button, selectedMessages[button])}
                    disabled={!isConnected || transferringButton !== null}
                  >
                    {transferringButton === button ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>📤 Transferir</Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.configButton, { backgroundColor: '#8B5CF6' }]}
                  onPress={() => handlePlayButton(button)}
                  disabled={!isConnected}
                >
                  <Text style={styles.buttonText}>🔊 Reproducir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Category Control */}
        <View style={[styles.categoryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            📁 Control de Categoría
          </Text>
          
          {esp32Status?.category && (
            <Text style={[styles.currentCategory, { color: colors.text }]}>
              Categoría actual: {esp32Status.category}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleChangeCategory}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>🔄 Cambiar Categoría</Text>
          </TouchableOpacity>
        </View>

        {/* Messages Summary */}
        <View style={[styles.messagesCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            📋 Mensajes Disponibles
          </Text>
          <Text style={[styles.messageCount, { color: colors.textSecondary }]}>
            {messages.length} mensajes cargados desde el backend
          </Text>
          
          {messages.length === 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={fetchMessages}
            >
              <Text style={styles.buttonText}>🔄 Recargar Mensajes</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  transferStatus: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  transferTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transferText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonConfigCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonConfig: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedMessage: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
  },
  buttonActions: {
    flexDirection: 'row',
    gap: 8,
  },
  configButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  categoryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  currentCategory: {
    fontSize: 14,
    marginBottom: 12,
  },
  messagesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  messageCount: {
    fontSize: 14,
    marginBottom: 12,
  },
});

