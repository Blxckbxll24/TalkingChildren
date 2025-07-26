import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useESP32WebSocketStore } from '../stores/esp32WebSocketStore';
import BottomNavBar from '../components/Navbar';
import { WEBSOCKET_URL } from '../config/env';

export default function ESP32AdminControlScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState(WEBSOCKET_URL);
  const { status, connecting, connect, disconnect, sendCommand, error } = useESP32WebSocketStore();
  const [currentCategory, setCurrentCategory] = useState(1);
  const [hasAutoConnected, setHasAutoConnected] = useState(false);

  const categories = ['Básico', 'Emociones', 'Necesidades'];
  
  // CONEXIÓN AUTOMÁTICA AL MONTAR EL COMPONENTE (solo una vez)
  useEffect(() => {
    console.log('🔍 ESP32AdminControlScreen - Estado:', {
      hasAutoConnected,
      connected: status.connected,
      connecting,
      url
    });
    
    if (!hasAutoConnected && !status.connected && !connecting) {
      console.log('🔌 Conectando automáticamente...');
      setHasAutoConnected(true);
      connect(url);
    }
    
    return () => {
      console.log('🔌 Desmontando');
      // No desconectar automáticamente para mantener conexión
    };
  }, [url, connect, status.connected, connecting, hasAutoConnected]);

  // Reset flag cuando se desconecta manualmente
  useEffect(() => {
    console.log('🔍 Estado de conexión cambió:', { connected: status.connected, connecting });
    if (!status.connected && !connecting) {
      setHasAutoConnected(false);
    }
  }, [status.connected, connecting]);

  // Log adicional para debugging (reducido)
  useEffect(() => {
    if (error) {
      console.log('⚠️ ESP32 Error:', error);
    }
  }, [error]);

  const handleSendCommand = (type: string, data?: any) => {
    if (!status.connected) {
      Alert.alert('Error', 'ESP32 no está conectado');
      return;
    }
    
    // Crear el comando apropiado según el tipo
    let command;
    if (data) {
      command = { type, ...data };
    } else {
      command = { type };
    }
    
    sendCommand(command);
    console.log(`📤 ${type}:`, command.type);
  };

  const handleTestConnection = () => {
    console.log('🧪 Test conexión...');
    // Solicitar estado del ESP32 al backend
    sendCommand({ type: 'get_esp32_status' });
    
    // También probar comando directo al ESP32 si está conectado
    setTimeout(() => {
      sendCommand({ type: 'get_status' });
    }, 500);
  };

  const handleForceReconnect = () => {
    console.log('🔄 Forzando reconexión...');
    disconnect();
    setTimeout(() => {
      connect(url);
    }, 1000);
  };

  const handleChangeCategory = (categoryId: number) => {
    setCurrentCategory(categoryId);
    handleSendCommand('change_category', { category: categoryId });
  };

  const getConnectionStatusColor = () => {
    if (status.connected) return '#4CAF50';
    if (connecting) return '#FF9800';
    return '#F44336';
  };

  const getConnectionStatusText = () => {
    if (status.connected) return '🟢 Sistema Conectado';
    if (connecting) return '🟡 Conectando al servidor...';
    return '🔴 Desconectado';
  };

  const getESP32StatusText = () => {
    // Determinar si hay un ESP32 real conectado basado en si tenemos datos del ESP32
    const hasESP32Data = status.battery !== undefined || status.category !== undefined;
    if (status.connected && hasESP32Data) {
      return '📡 ESP32 Hardware: Conectado';
    } else if (status.connected) {
      return '📡 ESP32 Hardware: Verificando...';
    }
    return '📡 ESP32 Hardware: Desconectado';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: insets.top }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
              Control ESP32 TalkingChildren
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Configuración: 4 botones físicos, 3 categorías, archivos .wav
            </Text>
          </View>

        {/* Estado de Conexión */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: getConnectionStatusColor(),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Estado de Conexión
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 4 }}>
            {getConnectionStatusText()}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 4, color: status.battery !== undefined ? '#4CAF50' : '#666' }}>
            {getESP32StatusText()}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            Servidor: {url}
          </Text>
          {status.battery !== undefined && (
            <Text style={{ fontSize: 12, color: '#666' }}>
              🔋 Batería ESP32: {status.battery}% | Categoría: {status.category || 'N/A'}
            </Text>
          )}
          {status.connected && status.battery === undefined && (
            <Text style={{ fontSize: 12, color: '#FF9800' }}>
              ⚠️ Conectado al servidor, pero ESP32 hardware no detectado
            </Text>
          )}
          {error && (
            <Text style={{ fontSize: 12, color: '#F44336', marginTop: 4 }}>
              ❌ Error: {error}
            </Text>
          )}
        </View>

        {/* Configuración de Conexión */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Configuración WebSocket
          </Text>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="ws://IP:8080/ws"
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 12,
              backgroundColor: '#f9f9f9'
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => connect(url)}
              disabled={status.connected || connecting}
              style={{ 
                backgroundColor: status.connected ? '#ccc' : '#4CAF50', 
                padding: 12, 
                borderRadius: 8, 
                flex: 1, 
                marginRight: 8,
                opacity: status.connected || connecting ? 0.6 : 1
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                {connecting ? 'Conectando...' : 'Conectar'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={disconnect}
              disabled={!status.connected}
              style={{ 
                backgroundColor: !status.connected ? '#ccc' : '#F44336', 
                padding: 12, 
                borderRadius: 8, 
                flex: 1,
                opacity: !status.connected ? 0.6 : 1
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                Desconectar
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Botones de Diagnóstico */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity
              onPress={handleTestConnection}
              disabled={!status.connected}
              style={{ 
                backgroundColor: !status.connected ? '#ccc' : '#2196F3', 
                padding: 10, 
                borderRadius: 8, 
                flex: 1, 
                marginRight: 4,
                opacity: !status.connected ? 0.6 : 1
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 12 }}>
                Test ESP32
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleForceReconnect}
              style={{ 
                backgroundColor: '#FF9800', 
                padding: 10, 
                borderRadius: 8, 
                flex: 1, 
                marginLeft: 4
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 12 }}>
                Reconectar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gestión de Mensajes */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 }}>
            Gestión de Mensajes
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('AudioMessages' as never)}
            style={{ 
              backgroundColor: '#4CAF50', 
              padding: 16, 
              borderRadius: 12, 
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialIcons name="audiotrack" size={24} color="white" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                Gestionar Mensajes de Audio
              </Text>
              <Text style={{ color: 'white', opacity: 0.8, fontSize: 12 }}>
                Crear y editar archivos .wav para el ESP32
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('ButtonMessages' as never)}
            style={{ 
              backgroundColor: '#FF9800', 
              padding: 16, 
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialIcons name="radio-button-checked" size={24} color="white" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                Configurar Botones
              </Text>
              <Text style={{ color: 'white', opacity: 0.8, fontSize: 12 }}>
                Asignar mensajes a los 3 botones físicos
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Control de Categorías */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Control de Categorías
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Categoría actual: {categories[currentCategory - 1]}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleChangeCategory(index + 1)}
                style={{ 
                  backgroundColor: currentCategory === index + 1 ? '#2196F3' : '#e0e0e0', 
                  padding: 12, 
                  borderRadius: 8, 
                  flex: 1,
                  marginHorizontal: 2,
                  opacity: status.connected ? 1 : 0.5
                }}
                disabled={!status.connected}
              >
                <Text style={{ 
                  textAlign: 'center', 
                  color: currentCategory === index + 1 ? 'white' : '#333', 
                  fontWeight: '600',
                  fontSize: 12
                }}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={{ fontSize: 11, color: '#666', marginTop: 8, textAlign: 'center' }}>
            💡 También puedes cambiar categoría presionando 3 veces el botón 3 del ESP32
          </Text>
        </View>

        {/* Pruebas de Botones */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Pruebas de Botones ESP32
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Simular presión de botones físicos del ESP32
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            {[1, 2, 3].map((buttonNum) => (
              <TouchableOpacity
                key={buttonNum}
                onPress={() => handleSendCommand('play_audio', { button: buttonNum })}
                style={{ 
                  backgroundColor: status.connected ? '#2196F3' : '#ccc', 
                  padding: 12, 
                  borderRadius: 8, 
                  flex: 1,
                  marginHorizontal: 2,
                  opacity: status.connected ? 1 : 0.5
                }}
                disabled={!status.connected}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                  Botón {buttonNum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>
            Botón 4: Mantener 3s = Encender/Apagar | Presión corta = Info conexión
          </Text>
        </View>

        {/* Comandos del Sistema */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Comandos del Sistema
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              onPress={() => handleSendCommand('get_status')}
              style={{ 
                backgroundColor: '#4CAF50', 
                padding: 12, 
                borderRadius: 8, 
                flex: 1, 
                marginRight: 4,
                opacity: status.connected ? 1 : 0.5
              }}
              disabled={!status.connected}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 12 }}>
                🔄 Estado
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleSendCommand('battery')}
              style={{ 
                backgroundColor: '#FF9800', 
                padding: 12, 
                borderRadius: 8, 
                flex: 1, 
                marginHorizontal: 2,
                opacity: status.connected ? 1 : 0.5
              }}
              disabled={!status.connected}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 12 }}>
                🔋 Batería
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Confirmar Apagado',
                  '¿Estás seguro de que quieres apagar el ESP32?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Apagar', style: 'destructive', onPress: () => handleSendCommand('shutdown') }
                  ]
                );
              }}
              style={{ 
                backgroundColor: '#F44336', 
                padding: 12, 
                borderRadius: 8, 
                flex: 1, 
                marginLeft: 4,
                opacity: status.connected ? 1 : 0.5
              }}
              disabled={!status.connected}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 12 }}>
                🔌 Apagar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información del Hardware */}
        <View style={{ 
          backgroundColor: '#E3F2FD', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1976D2', marginBottom: 8 }}>
            ℹ️ Información del Hardware
          </Text>
          <Text style={{ fontSize: 12, color: '#333', lineHeight: 18 }}>
            • <Text style={{ fontWeight: '600' }}>Botón 1-2:</Text> Reproducir mensajes{'\n'}
            • <Text style={{ fontWeight: '600' }}>Botón 3:</Text> Reproducir mensaje / 3x presiones = Cambiar categoría{'\n'}
            • <Text style={{ fontWeight: '600' }}>Botón 4:</Text> Info conexión / Mantener 3s = Encender/Apagar{'\n'}
            • <Text style={{ fontWeight: '600' }}>Archivos:</Text> 001.wav - 009.wav en microSD{'\n'}
            • <Text style={{ fontWeight: '600' }}>Categorías:</Text> 3 categorías con 3 mensajes cada una
          </Text>
        </View>
        </View>
      </ScrollView>
      <BottomNavBar theme={theme} />
    </View>
  );
}