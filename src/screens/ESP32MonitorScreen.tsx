import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useESP32WebSocketStore } from '../stores/esp32WebSocketStore';
import BottomNavBar from '../components/Navbar';
import { WEBSOCKET_URL } from '../config/env';

const ESP32_WEBSOCKET_URL = WEBSOCKET_URL;

interface ButtonPressEvent {
  id: string;
  button: number;
  category: number;
  messageId: number;
  audioFile: string;
  timestamp: number;
  time: string;
  categoryName: string;
}

interface HeartbeatEvent {
  id: string;
  battery: number;
  system_on: boolean;
  category: number;
  timestamp: number;
  time: string;
}

interface CategoryChangeEvent {
  id: string;
  category: number;
  categoryName: string;
  timestamp: number;
  time: string;
}

export default function ESP32MonitorScreen() {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { 
    status, 
    connecting,
    connect, 
    disconnect,
    sendCommand,
    addEventListener 
  } = useESP32WebSocketStore();
  
  const [buttonEvents, setButtonEvents] = useState<ButtonPressEvent[]>([]);
  const [heartbeats, setHeartbeats] = useState<HeartbeatEvent[]>([]);
  const [categoryChanges, setCategoryChanges] = useState<CategoryChangeEvent[]>([]);
  const [lastActivity, setLastActivity] = useState<string>('Ninguna');

  // Variables derivadas del store
  const isConnected = status?.connected || false;
  const isConnecting = connecting || false;
  const esp32Status = status;

  useEffect(() => {
    // NO auto-conectar automáticamente
    // El usuario debe presionar el botón "Conectar" manualmente
  }, []);

  // Agregar listener para eventos ESP32
  useEffect(() => {
    const unsubscribe = addEventListener({
      onButtonPressed: (event) => {
        const buttonEvent: ButtonPressEvent = {
          id: `btn_${Date.now()}_${Math.random()}`,
          button: event.button,
          category: event.category,
          messageId: event.messageId,
          audioFile: event.audioFile,
          timestamp: event.timestamp,
          time: new Date().toLocaleTimeString(),
          categoryName: event.categoryName
        };
        
        setButtonEvents(prev => [buttonEvent, ...prev.slice(0, 49)]); // Mantener últimos 50
        setLastActivity(`Botón ${event.button} - ${event.categoryName}`);
        
        console.log('🔘 Evento botón recibido en monitor:', buttonEvent);
      },
      
      onCategoryChanged: (event) => {
        const categoryEvent: CategoryChangeEvent = {
          id: `cat_${Date.now()}_${Math.random()}`,
          category: event.category,
          categoryName: event.categoryName,
          timestamp: event.timestamp,
          time: new Date().toLocaleTimeString()
        };
        
        setCategoryChanges(prev => [categoryEvent, ...prev.slice(0, 19)]); // Mantener últimos 20
        setLastActivity(`Cambio a ${event.categoryName}`);
        
        console.log('📁 Cambio de categoría recibido en monitor:', categoryEvent);
      },
      
      onHeartbeat: (event) => {
        const heartbeatEvent: HeartbeatEvent = {
          id: `hb_${Date.now()}_${Math.random()}`,
          battery: event.battery,
          system_on: event.system_on,
          category: event.category,
          timestamp: event.timestamp,
          time: new Date().toLocaleTimeString()
        };
        
        setHeartbeats(prev => [heartbeatEvent, ...prev.slice(0, 9)]); // Mantener últimos 10
        setLastActivity('Heartbeat recibido');
        
        console.log('💓 Heartbeat recibido en monitor:', heartbeatEvent);
      }
    });

    return unsubscribe;
  }, [addEventListener]);

  // Simulamos algunos eventos para demostración
  useEffect(() => {
    // Aquí puedes agregar lógica para escuchar eventos reales del ESP32
    // Por ahora solo actualizamos la última actividad basada en el estado
    if (isConnected) {
      setLastActivity('ESP32 Conectado');
    } else {
      setLastActivity('ESP32 Desconectado');
    }
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      connect(ESP32_WEBSOCKET_URL);
      // Request initial status after connection attempt
      setTimeout(() => sendCommand({ type: 'get_status' }), 1000);
    } catch (error) {
      
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const clearEvents = () => {
    Alert.alert(
      'Limpiar eventos',
      '¿Estás seguro de que quieres limpiar todos los eventos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive',
          onPress: () => {
            setButtonEvents([]);
            setHeartbeats([]);
            setCategoryChanges([]);
            setLastActivity('Ninguna');
          }
        }
      ]
    );
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return { text: '✅ Conectado', color: colors.success };
    } else if (isConnecting) {
      return { text: '🔄 Conectando...', color: colors.warning };
    } else {
      return { text: '❌ Desconectado', color: colors.error };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Monitor ESP32 TalkingChildren
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Eventos en tiempo real
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Estado de Conexión
          </Text>
          <Text style={[styles.statusText, { color: connectionStatus.color }]}>
            {connectionStatus.text}
          </Text>
          
          {esp32Status && (
            <>
              <Text style={[styles.deviceInfo, { color: colors.textSecondary }]}>
                🔋 Batería: {esp32Status.battery || 0}% | 📁 Categoría: {esp32Status.category || 1}
              </Text>
              <Text style={[styles.deviceInfo, { color: colors.textSecondary }]}>
                📶 Estado: {isConnected ? 'Conectado' : 'Desconectado'} | ⏱️ Monitor en tiempo real
              </Text>
            </>
          )}

          <Text style={[styles.lastActivity, { color: colors.text }]}>
            Última actividad: {lastActivity}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isConnected ? colors.error : colors.primary }
              ]}
              onPress={isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
            >
              <Text style={styles.buttonText}>
                {isConnected ? '🔌 Desconectar' : '🔗 Conectar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={clearEvents}
            >
              <Text style={styles.buttonText}>🗑️ Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Button Press Events */}
        <View style={[styles.eventsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🔘 Botones Presionados ({buttonEvents.length})
          </Text>
          
          {buttonEvents.length === 0 ? (
            <Text style={[styles.noEvents, { color: colors.textSecondary }]}>
              No hay eventos de botones aún
            </Text>
          ) : (
            buttonEvents.slice(0, 10).map((event) => (
              <View key={event.id} style={[styles.eventItem, { borderLeftColor: colors.primary }]}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>
                    Botón {event.button}
                  </Text>
                  <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                    {event.time}
                  </Text>
                </View>
                <Text style={[styles.eventDetails, { color: colors.textSecondary }]}>
                  📁 {event.categoryName} | 🎵 {event.audioFile} | ID: {event.messageId}
                </Text>
                <Text style={[styles.eventTimestamp, { color: colors.textSecondary }]}>
                  Timestamp ESP32: {event.timestamp}ms
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Category Changes */}
        <View style={[styles.eventsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            📁 Cambios de Categoría ({categoryChanges.length})
          </Text>
          
          {categoryChanges.length === 0 ? (
            <Text style={[styles.noEvents, { color: colors.textSecondary }]}>
              No hay cambios de categoría aún
            </Text>
          ) : (
            categoryChanges.slice(0, 5).map((event) => (
              <View key={event.id} style={[styles.eventItem, { borderLeftColor: colors.warning }]}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>
                    {event.categoryName}
                  </Text>
                  <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                    {event.time}
                  </Text>
                </View>
                <Text style={[styles.eventDetails, { color: colors.textSecondary }]}>
                  Categoría {event.category} seleccionada
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Heartbeat Status */}
        <View style={[styles.eventsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            💓 Estado del Sistema
          </Text>
          
          {heartbeats.length === 0 ? (
            <Text style={[styles.noEvents, { color: colors.textSecondary }]}>
              No hay heartbeats recibidos
            </Text>
          ) : (
            <View style={styles.heartbeatGrid}>
              {heartbeats.slice(0, 3).map((hb) => (
                <View key={hb.id} style={[styles.heartbeatItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.heartbeatTime, { color: colors.textSecondary }]}>
                    {hb.time}
                  </Text>
                  <Text style={[styles.heartbeatData, { color: colors.text }]}>
                    🔋 {hb.battery}%
                  </Text>
                  <Text style={[styles.heartbeatData, { color: colors.text }]}>
                    📁 Cat. {hb.category}
                  </Text>
                  <Text style={[styles.heartbeatData, { color: hb.system_on ? colors.success : colors.error }]}>
                    {hb.system_on ? '✅ ON' : '❌ OFF'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            📋 Instrucciones
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • Presiona los botones físicos del ESP32 para ver los eventos aquí
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • Los eventos se muestran en tiempo real cuando el ESP32 está conectado
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • Cambia categorías con triple-click en el botón 3 del ESP32
          </Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            • El heartbeat se envía cada ~60 segundos automáticamente
          </Text>
        </View>
        </View>
      </ScrollView>
      <BottomNavBar theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 4,
  },
  lastActivity: {
    fontSize: 14,
    fontWeight: 'bold',
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
  eventsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noEvents: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  eventItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 12,
  },
  eventDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  eventTimestamp: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  heartbeatGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  heartbeatItem: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  heartbeatTime: {
    fontSize: 10,
    marginBottom: 4,
  },
  heartbeatData: {
    fontSize: 12,
    marginBottom: 2,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});
