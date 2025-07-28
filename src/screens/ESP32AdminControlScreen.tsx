import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useESP32WebSocketStore } from '../stores/esp32WebSocketStore';
import { useAuthStore } from '../stores/authStore';
import BottomNavBar from '../components/Navbar';
import { WEBSOCKET_URL } from '../config/env';

export default function ESP32AdminControlScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [url, setUrl] = useState(WEBSOCKET_URL);
  const { status, connecting, connect, disconnect, sendCommand, error } = useESP32WebSocketStore();
  const [currentCategory, setCurrentCategory] = useState(1);
  const [hasAutoConnected, setHasAutoConnected] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(1);
  const [showMessageList, setShowMessageList] = useState(false);
  const [showButtonConfig, setShowButtonConfig] = useState(false);
  const [buttonConfig, setButtonConfig] = useState([1, 2, 3]);

  const categories = ['Básico', 'Emociones', 'Necesidades', 'Saludos', 'Familia', 'Comida', 'Juegos', 'Escuela', 'Salud', 'Transporte'];
  
  // Configuración completa de los 100 mensajes
  const allMessages = [
    // Categoría 1 - Básico (001-010)
    { id: 1, file: "001.wav", title: "Hola buenos dias", category: 1 },
    { id: 2, file: "002.wav", title: "Necesito ayuda", category: 1 },
    { id: 3, file: "003.wav", title: "Muchas gracias", category: 1 },
    { id: 4, file: "004.wav", title: "Por favor", category: 1 },
    { id: 5, file: "005.wav", title: "Disculpa", category: 1 },
    { id: 6, file: "006.wav", title: "Si estoy de acuerdo", category: 1 },
    { id: 7, file: "007.wav", title: "No, no quiero", category: 1 },
    { id: 8, file: "008.wav", title: "Esta bien", category: 1 },
    { id: 9, file: "009.wav", title: "No entiendo", category: 1 },
    { id: 10, file: "010.wav", title: "Hasta luego", category: 1 },
    
    // Categoría 2 - Emociones (011-020)
    { id: 11, file: "011.wav", title: "Me siento feliz", category: 2 },
    { id: 12, file: "012.wav", title: "Estoy triste", category: 2 },
    { id: 13, file: "013.wav", title: "Tengo miedo", category: 2 },
    { id: 14, file: "014.wav", title: "Me siento enojado", category: 2 },
    { id: 15, file: "015.wav", title: "Estoy emocionado", category: 2 },
    { id: 16, file: "016.wav", title: "Me siento cansado", category: 2 },
    { id: 17, file: "017.wav", title: "Estoy nervioso", category: 2 },
    { id: 18, file: "018.wav", title: "Me siento solo", category: 2 },
    { id: 19, file: "019.wav", title: "Estoy orgulloso", category: 2 },
    { id: 20, file: "020.wav", title: "Me siento bien", category: 2 },
    
    // Categoría 3 - Necesidades (021-030)
    { id: 21, file: "021.wav", title: "Necesito ir al baño", category: 3 },
    { id: 22, file: "022.wav", title: "Tengo hambre", category: 3 },
    { id: 23, file: "023.wav", title: "Tengo sed", category: 3 },
    { id: 24, file: "024.wav", title: "Tengo sueño", category: 3 },
    { id: 25, file: "025.wav", title: "Tengo frio", category: 3 },
    { id: 26, file: "026.wav", title: "Tengo calor", category: 3 },
    { id: 27, file: "027.wav", title: "Me duele algo", category: 3 },
    { id: 28, file: "028.wav", title: "Quiero descansar", category: 3 },
    { id: 29, file: "029.wav", title: "Necesito medicina", category: 3 },
    { id: 30, file: "030.wav", title: "Quiero agua", category: 3 },
    
    // Categoría 4 - Saludos (031-040)
    { id: 31, file: "031.wav", title: "Hola mama", category: 4 },
    { id: 32, file: "032.wav", title: "Hola papa", category: 4 },
    { id: 33, file: "033.wav", title: "Buenos dias", category: 4 },
    { id: 34, file: "034.wav", title: "Buenas tardes", category: 4 },
    { id: 35, file: "035.wav", title: "Buenas noches", category: 4 },
    { id: 36, file: "036.wav", title: "Hasta mañana", category: 4 },
    { id: 37, file: "037.wav", title: "Nos vemos luego", category: 4 },
    { id: 38, file: "038.wav", title: "Adios", category: 4 },
    { id: 39, file: "039.wav", title: "Buen dia", category: 4 },
    { id: 40, file: "040.wav", title: "Que descanses", category: 4 },
    
    // Categoría 5 - Familia (041-050)
    { id: 41, file: "041.wav", title: "Quiero ver a mama", category: 5 },
    { id: 42, file: "042.wav", title: "Extraño a papa", category: 5 },
    { id: 43, file: "043.wav", title: "Amo a mi familia", category: 5 },
    { id: 44, file: "044.wav", title: "Quiero ir a casa", category: 5 },
    { id: 45, file: "045.wav", title: "Mi hermano es genial", category: 5 },
    { id: 46, file: "046.wav", title: "Abuela te amo", category: 5 },
    { id: 47, file: "047.wav", title: "Abuelo me cuida", category: 5 },
    { id: 48, file: "048.wav", title: "Mi familia me quiere", category: 5 },
    { id: 49, file: "049.wav", title: "Estoy en casa", category: 5 },
    { id: 50, file: "050.wav", title: "Quiero un abrazo", category: 5 },
    
    // Categoría 6 - Comida (051-060)
    { id: 51, file: "051.wav", title: "Quiero comer", category: 6 },
    { id: 52, file: "052.wav", title: "Esta delicioso", category: 6 },
    { id: 53, file: "053.wav", title: "No me gusta", category: 6 },
    { id: 54, file: "054.wav", title: "Quiero mas", category: 6 },
    { id: 55, file: "055.wav", title: "Ya termine", category: 6 },
    { id: 56, file: "056.wav", title: "Quiero fruta", category: 6 },
    { id: 57, file: "057.wav", title: "Me gusta el pan", category: 6 },
    { id: 58, file: "058.wav", title: "Quiero leche", category: 6 },
    { id: 59, file: "059.wav", title: "Esta muy rico", category: 6 },
    { id: 60, file: "060.wav", title: "Quiero postre", category: 6 },
    
    // Categoría 7 - Juegos (061-070)
    { id: 61, file: "061.wav", title: "Quiero jugar", category: 7 },
    { id: 62, file: "062.wav", title: "Es mi turno", category: 7 },
    { id: 63, file: "063.wav", title: "Jugamos juntos", category: 7 },
    { id: 64, file: "064.wav", title: "Me gusta este juego", category: 7 },
    { id: 65, file: "065.wav", title: "Gane el juego", category: 7 },
    { id: 66, file: "066.wav", title: "Es divertido", category: 7 },
    { id: 67, file: "067.wav", title: "Quiero la pelota", category: 7 },
    { id: 68, file: "068.wav", title: "Vamos al parque", category: 7 },
    { id: 69, file: "069.wav", title: "Me gusta correr", category: 7 },
    { id: 70, file: "070.wav", title: "Hora de jugar", category: 7 },
    
    // Categoría 8 - Escuela (071-080)
    { id: 71, file: "071.wav", title: "Voy a la escuela", category: 8 },
    { id: 72, file: "072.wav", title: "Me gusta aprender", category: 8 },
    { id: 73, file: "073.wav", title: "Tengo tarea", category: 8 },
    { id: 74, file: "074.wav", title: "Mi maestra es buena", category: 8 },
    { id: 75, file: "075.wav", title: "Necesito ayuda", category: 8 },
    { id: 76, file: "076.wav", title: "Ya entendi", category: 8 },
    { id: 77, file: "077.wav", title: "Quiero leer", category: 8 },
    { id: 78, file: "078.wav", title: "Me gusta dibujar", category: 8 },
    { id: 79, file: "079.wav", title: "Hora del recreo", category: 8 },
    { id: 80, file: "080.wav", title: "Termine mi trabajo", category: 8 },
    
    // Categoría 9 - Salud (081-090)
    { id: 81, file: "081.wav", title: "Me siento bien", category: 9 },
    { id: 82, file: "082.wav", title: "Me duele la cabeza", category: 9 },
    { id: 83, file: "083.wav", title: "Necesito medicina", category: 9 },
    { id: 84, file: "084.wav", title: "Quiero ver al doctor", category: 9 },
    { id: 85, file: "085.wav", title: "Me duele el estomago", category: 9 },
    { id: 86, file: "086.wav", title: "Estoy enfermo", category: 9 },
    { id: 87, file: "087.wav", title: "Me siento mejor", category: 9 },
    { id: 88, file: "088.wav", title: "Necesito descansar", category: 9 },
    { id: 89, file: "089.wav", title: "Tomare mi medicina", category: 9 },
    { id: 90, file: "090.wav", title: "Ya me cure", category: 9 },
    
    // Categoría 10 - Transporte (091-100)
    { id: 91, file: "091.wav", title: "Quiero ir en carro", category: 10 },
    { id: 92, file: "092.wav", title: "Vamos en autobus", category: 10 },
    { id: 93, file: "093.wav", title: "Me gusta caminar", category: 10 },
    { id: 94, file: "094.wav", title: "Vamos rapido", category: 10 },
    { id: 95, file: "095.wav", title: "Llegamos ya", category: 10 },
    { id: 96, file: "096.wav", title: "Quiero ir lejos", category: 10 },
    { id: 97, file: "097.wav", title: "Cerca de casa", category: 10 },
    { id: 98, file: "098.wav", title: "Vamos despacio", category: 10 },
    { id: 99, file: "099.wav", title: "Subir al carro", category: 10 },
    { id: 100, file: "100.wav", title: "Bajar aqui", category: 10 }
  ];
  
  // Función para obtener información específica por rol
  const getRoleSpecificInfo = () => {
    const userRole = user?.role_name?.toLowerCase();
    
    switch (userRole) {
      case 'administrador':
        return {
          title: "Panel de Control Completo",
          description: "Acceso total para configurar y monitorear el dispositivo ESP32. Puedes cambiar categorías, controlar el sistema y ver estadísticas detalladas.",
          features: [
            "• Configuración avanzada del dispositivo",
            "• Control completo de categorías y mensajes",
            "• Monitoreo de batería y estado del sistema",
            "• Gestión de conexiones WebSocket"
          ]
        };
      case 'tutor':
        return {
          title: "Panel de Control para Tutores",
          description: "Herramientas para ayudar al niño a comunicarse mejor. Puedes cambiar categorías de mensajes y monitorear el uso del dispositivo.",
          features: [
            "• Cambio de categorías de mensajes",
            "• Monitoreo del estado del dispositivo",
            "• Configuración básica para las necesidades del niño",
            "• Seguimiento de la comunicación"
          ]
        };
      case 'niño':
        return {
          title: "Mi Dispositivo TalkingChildren",
          description: "¡Controla tu dispositivo de comunicación! Puedes cambiar los tipos de mensajes y ver cómo está funcionando.",
          features: [
            "• Cambiar categorías de mensajes favoritos",
            "• Ver el estado de tu dispositivo",
            "• Conectar con tu dispositivo",
            "• Controlar tus mensajes de voz"
          ]
        };
      default:
        return {
          title: "Panel de Control ESP32",
          description: "Control y configuración del dispositivo de comunicación TalkingChildren.",
          features: [
            "• Control básico del dispositivo",
            "• Cambio de categorías",
            "• Monitoreo de estado",
            "• Configuración de conexión"
          ]
        };
    }
  };
  
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

  // Funciones específicas para control de mensajes
  const handlePlaySpecificMessage = (messageId: number) => {
    const message = allMessages.find(m => m.id === messageId);
    if (message) {
      handleSendCommand('play_message', { messageId });
      Alert.alert(
        'Reproduciendo', 
        `Mensaje ${messageId}: ${message.title}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfigureButtons = (category: number, buttonMessages: number[]) => {
    if (buttonMessages.length !== 3) {
      Alert.alert('Error', 'Debe seleccionar exactamente 3 mensajes para los botones');
      return;
    }
    
    handleSendCommand('configure_buttons', { 
      category, 
      buttons: buttonMessages 
    });
    
    Alert.alert(
      'Configuración Actualizada', 
      `Botones de categoría ${categories[category - 1]} configurados:\n` +
      buttonMessages.map((id, index) => {
        const msg = allMessages.find(m => m.id === id);
        return `B${index + 1}: ${msg?.title || 'N/A'}`;
      }).join('\n')
    );
  };

  const getMessagesForCategory = (categoryId: number) => {
    return allMessages.filter(m => m.category === categoryId);
  };

  const getCurrentButtonConfig = () => {
    const categoryMessages = getMessagesForCategory(currentCategory);
    return [
      categoryMessages[0]?.id || 1,
      categoryMessages[1]?.id || 2,
      categoryMessages[2]?.id || 3
    ];
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
    <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#111827' : '#f5f5f5', paddingTop: insets.top }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? '#f9fafb' : '#333', marginBottom: 8 }}>
              Control ESP32 TalkingChildren
            </Text>
            <Text style={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#666' }}>
              Configuración y control del dispositivo - 4 botones físicos, 10 categorías, 100 mensajes
            </Text>
          </View>

        {/* Estado de Conexión */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white', 
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
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
            Estado de Conexión
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 4, color: theme === 'dark' ? '#e5e7eb' : '#333' }}>
            {getConnectionStatusText()}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 4, color: status.battery !== undefined ? '#4CAF50' : (theme === 'dark' ? '#9ca3af' : '#666') }}>
            {getESP32StatusText()}
          </Text>
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#666', marginBottom: 8 }}>
            Servidor: {url}
          </Text>
          {status.battery !== undefined && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#666' }}>
                🔋 Batería ESP32: {status.battery}% | Categoría: {status.category || 'N/A'}
              </Text>
              <Text style={{ fontSize: 12, color: status.system_on !== false ? '#4CAF50' : '#F44336' }}>
                ⚡ Estado Sistema: {status.system_on !== false ? 'ENCENDIDO' : 'APAGADO'}
              </Text>
            </View>
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
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
            Configuración WebSocket
          </Text>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="ws://IP:8080/ws"
            placeholderTextColor={theme === 'dark' ? '#6b7280' : '#9ca3af'}
            style={{ 
              borderWidth: 1, 
              borderColor: theme === 'dark' ? '#374151' : '#ddd', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 12,
              backgroundColor: theme === 'dark' ? '#374151' : '#f9f9f9',
              color: theme === 'dark' ? '#f9fafb' : '#333'
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
              onPress={handleForceReconnect}
              style={{ 
                backgroundColor: '#FF9800', 
                padding: 10, 
                borderRadius: 8, 
                flex: 1
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 12 }}>
                Reconectar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información específica por rol */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: user?.role_name?.toLowerCase() === 'administrador' ? '#dc2626' : 
                           user?.role_name?.toLowerCase() === 'tutor' ? '#2563eb' : '#16a34a',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            marginBottom: 8, 
            color: user?.role_name?.toLowerCase() === 'administrador' ? '#dc2626' : 
                   user?.role_name?.toLowerCase() === 'tutor' ? '#2563eb' : '#16a34a'
          }}>
            {getRoleSpecificInfo().title}
          </Text>
          <Text style={{ 
            fontSize: 13, 
            color: theme === 'dark' ? '#e2e8f0' : '#475569', 
            marginBottom: 12, 
            lineHeight: 18 
          }}>
            {getRoleSpecificInfo().description}
          </Text>
          <View>
            {getRoleSpecificInfo().features.map((feature, index) => (
              <Text key={index} style={{ 
                fontSize: 12, 
                color: theme === 'dark' ? '#cbd5e1' : '#64748b', 
                marginBottom: 4,
                lineHeight: 16
              }}>
                {feature}
              </Text>
            ))}
          </View>
        </View>

        {/* Control de Categorías */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
            Control de Categorías
          </Text>
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#666', marginBottom: 12 }}>
            Categoría actual: {categories[currentCategory - 1]} ({currentCategory}/10)
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleChangeCategory(index + 1)}
                style={{ 
                  backgroundColor: currentCategory === index + 1 ? '#2196F3' : '#e0e0e0', 
                  padding: 8, 
                  borderRadius: 6, 
                  width: '18%',
                  marginBottom: 8,
                  opacity: status.connected ? 1 : 0.5
                }}
                disabled={!status.connected}
              >
                <Text style={{ 
                  textAlign: 'center', 
                  color: currentCategory === index + 1 ? 'white' : '#333', 
                  fontWeight: '600',
                  fontSize: 10
                }}>
                  {index + 1}
                </Text>
                <Text style={{ 
                  textAlign: 'center', 
                  color: currentCategory === index + 1 ? 'white' : '#333', 
                  fontWeight: '400',
                  fontSize: 8
                }}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#666', marginTop: 8, textAlign: 'center' }}>
            💡 10 categorías con 100 mensajes totales (10 por categoría)
          </Text>
          <Text style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#666', marginTop: 4, textAlign: 'center' }}>
            Triple presión B3 en ESP32 = Cambiar categoría
          </Text>
        </View>

        {/* Control de Mensajes Específicos - NUEVO */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
            🎵 Control de Mensajes (App → ESP32)
          </Text>
          
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#666', marginBottom: 12 }}>
            Reproducir cualquier mensaje específico de los 100 disponibles
          </Text>

          {/* Selector de mensaje específico */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
              Mensaje Específico (ID 1-100):
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={selectedMessageId.toString()}
                onChangeText={(text) => {
                  // Permitir campo vacío temporalmente mientras se escribe
                  if (text === '') {
                    setSelectedMessageId(1);
                    return;
                  }
                  
                  // Solo procesar si es un número válido
                  const numericValue = text.replace(/[^0-9]/g, '');
                  if (numericValue === '') {
                    setSelectedMessageId(1);
                    return;
                  }
                  
                  const id = parseInt(numericValue);
                  if (!isNaN(id) && id >= 1 && id <= 100) {
                    setSelectedMessageId(id);
                  }
                }}
                keyboardType="numeric"
                maxLength={3}
                selectTextOnFocus={true}
                placeholderTextColor={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                style={{ 
                  borderWidth: 1, 
                  borderColor: theme === 'dark' ? '#374151' : '#ddd', 
                  padding: 10, 
                  borderRadius: 8, 
                  width: 60,
                  textAlign: 'center',
                  marginRight: 10,
                  backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                  color: theme === 'dark' ? '#f9fafb' : '#333'
                }}
              />
              <TouchableOpacity
                onPress={() => handlePlaySpecificMessage(selectedMessageId)}
                disabled={!status.connected}
                style={{ 
                  backgroundColor: status.connected ? '#FF5722' : '#ccc', 
                  padding: 10, 
                  borderRadius: 8, 
                  flex: 1,
                  opacity: status.connected ? 1 : 0.5
                }}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                  ▶️ Reproducir ID {selectedMessageId}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Mostrar información del mensaje seleccionado */}
            {(() => {
              const message = allMessages.find(m => m.id === selectedMessageId);
              return message ? (
                <View style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: 10, 
                  borderRadius: 8, 
                  marginTop: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#0284c7'
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7' }}>
                    📁 {message.file} | Cat. {message.category}: {categories[message.category - 1]}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#333', marginTop: 2 }}>
                    💬 {message.title}
                  </Text>
                </View>
              ) : null;
            })()}
          </View>

          {/* Lista de mensajes por categoría */}
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setShowMessageList(!showMessageList)}
              style={{ 
                backgroundColor: '#e3f2fd', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: showMessageList ? 12 : 0
              }}
            >
              <Text style={{ textAlign: 'center', color: '#1976d2', fontWeight: '600' }}>
                {showMessageList ? '🔼' : '🔽'} Ver Mensajes de {categories[currentCategory - 1]} (Cat. {currentCategory})
              </Text>
            </TouchableOpacity>

            {showMessageList && (
              <View style={{ 
                backgroundColor: '#fafafa', 
                padding: 12, 
                borderRadius: 8,
                maxHeight: 200
              }}>
                <ScrollView style={{ maxHeight: 180 }}>
                  {getMessagesForCategory(currentCategory).map((message) => (
                    <TouchableOpacity
                      key={message.id}
                      onPress={() => handlePlaySpecificMessage(message.id)}
                      disabled={!status.connected}
                      style={{ 
                        backgroundColor: '#fff', 
                        padding: 10, 
                        borderRadius: 6, 
                        marginBottom: 6,
                        borderLeftWidth: 3,
                        borderLeftColor: '#4caf50',
                        opacity: status.connected ? 1 : 0.5
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }}>
                            ID {message.id}: {message.file}
                          </Text>
                          <Text style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                            {message.title}
                          </Text>
                        </View>
                        <MaterialIcons name="play-arrow" size={20} color="#4caf50" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Configuración de botones físicos */}
          <View>
            <TouchableOpacity
              onPress={() => setShowButtonConfig(!showButtonConfig)}
              style={{ 
                backgroundColor: '#fff3e0', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: showButtonConfig ? 12 : 0
              }}
            >
              <Text style={{ textAlign: 'center', color: '#f57c00', fontWeight: '600' }}>
                {showButtonConfig ? '🔼' : '🔽'} Configurar Botones Físicos (Cat. {currentCategory})
              </Text>
            </TouchableOpacity>

            {showButtonConfig && (
              <View style={{ 
                backgroundColor: '#fafafa', 
                padding: 12, 
                borderRadius: 8
              }}>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 12, textAlign: 'center' }}>
                  Selecciona qué mensajes aparecerán en los 3 botones físicos del ESP32
                </Text>
                
                {[0, 1, 2].map((buttonIndex) => (
                  <View key={buttonIndex} style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
                      Botón {buttonIndex + 1}: ID {buttonConfig[buttonIndex]}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {getMessagesForCategory(currentCategory).map((message) => (
                        <TouchableOpacity
                          key={message.id}
                          onPress={() => {
                            const newConfig = [...buttonConfig];
                            newConfig[buttonIndex] = message.id;
                            setButtonConfig(newConfig);
                          }}
                          style={{ 
                            backgroundColor: buttonConfig[buttonIndex] === message.id ? '#4caf50' : '#e0e0e0', 
                            padding: 6, 
                            borderRadius: 4, 
                            margin: 2,
                            minWidth: 40
                          }}
                        >
                          <Text style={{ 
                            textAlign: 'center', 
                            color: buttonConfig[buttonIndex] === message.id ? 'white' : '#333', 
                            fontSize: 10,
                            fontWeight: '600'
                          }}>
                            {message.id}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => handleConfigureButtons(currentCategory, buttonConfig)}
                  disabled={!status.connected}
                  style={{ 
                    backgroundColor: status.connected ? '#ff9800' : '#ccc', 
                    padding: 12, 
                    borderRadius: 8, 
                    marginTop: 8,
                    opacity: status.connected ? 1 : 0.5
                  }}
                >
                  <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                    🔧 Aplicar Configuración de Botones
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Pruebas de Botones */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
            Pruebas de Botones ESP32
          </Text>
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#666', marginBottom: 12 }}>
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

        {/* Control de Encendido/Apagado */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: theme === 'dark' ? '#f9fafb' : '#333' }}>
            Control de Alimentación ESP32
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Confirmar Encendido',
                  '¿Estás seguro de que quieres encender el ESP32?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Encender', style: 'default', onPress: () => handleSendCommand('wakeup') }
                  ]
                );
              }}
              style={{ 
                backgroundColor: status.connected ? '#4CAF50' : '#ccc', 
                padding: 16, 
                borderRadius: 8, 
                width: '48%',
                opacity: status.connected ? 1 : 0.5
              }}
              disabled={!status.connected}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 14 }}>
                ⚡ Encender ESP32
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
                backgroundColor: status.connected ? '#F44336' : '#ccc', 
                padding: 16, 
                borderRadius: 8, 
                width: '48%',
                opacity: status.connected ? 1 : 0.5
              }}
              disabled={!status.connected}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600', fontSize: 14 }}>
                🔌 Apagar ESP32
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#666', marginTop: 12, textAlign: 'center' }}>
            💡 También puedes usar el Botón 4 físico: mantener 3s = cambiar estado
          </Text>
        </View>

        {/* Información del Hardware */}
        <View style={{ 
          backgroundColor: theme === 'dark' ? '#1e3a8a20' : '#E3F2FD', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme === 'dark' ? '#60a5fa' : '#1976D2', marginBottom: 8 }}>
            ℹ️ Información del Hardware
          </Text>
          <Text style={{ fontSize: 12, color: theme === 'dark' ? '#e5e7eb' : '#333', lineHeight: 18 }}>
            • <Text style={{ fontWeight: '600' }}>Botón 1-2:</Text> Reproducir mensajes{'\n'}
            • <Text style={{ fontWeight: '600' }}>Botón 3:</Text> Reproducir mensaje / 3x presiones = Cambiar categoría{'\n'}
            • <Text style={{ fontWeight: '600' }}>Botón 4:</Text> Info conexión / Mantener 3s = Encender/Apagar{'\n'}
            • <Text style={{ fontWeight: '600' }}>Archivos:</Text> 001.wav - 100.wav en microSD{'\n'}
            • <Text style={{ fontWeight: '600' }}>Categorías:</Text> 10 categorías con 10 mensajes cada una{'\n'}
            • <Text style={{ fontWeight: '600' }}>Total:</Text> 100 mensajes de audio disponibles
          </Text>
        </View>
        </View>
      </ScrollView>
      <BottomNavBar theme={theme} />
    </View>
  );
}