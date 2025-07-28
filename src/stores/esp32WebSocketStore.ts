import { create } from 'zustand';
import { esp32WebSocketService } from '../services/esp32WebSocketService';

type ESP32Status = {
    connected: boolean;
    battery?: number;
    category?: number;
    system_on?: boolean;
    lastHeartbeat?: number;
};

// Event listeners para el monitor
type ESP32EventListener = {
    onButtonPressed?: (event: {
        button: number;
        category: number;
        messageId: number;
        audioFile: string;
        timestamp: number;
        categoryName: string;
    }) => void;
    onCategoryChanged?: (event: {
        category: number;
        categoryName: string;
        timestamp: number;
    }) => void;
    onHeartbeat?: (event: {
        battery: number;
        system_on: boolean;
        category: number;
        timestamp: number;
    }) => void;
};

type State = {
    status: ESP32Status;
    connecting: boolean;
    error: string | null;
    audioTransferProgress: { [filename: string]: number }; // Progreso de transferencia por archivo
    eventListeners: ESP32EventListener[]; // Lista de listeners para eventos
    connect: (url: string) => void;
    disconnect: () => void;
    sendCommand: (msg: any) => void;
    transferAudioFile: (audioData: any) => Promise<boolean>;
    configureButtonWithAudio: (buttonNumber: number, audioData: any) => Promise<boolean>;
    addEventListener: (listener: ESP32EventListener) => () => void;
    removeEventListener: (listener: ESP32EventListener) => void;
};

export const useESP32WebSocketStore = create<State>((set, get) => ({
    status: { connected: false },
    connecting: false,
    error: null,
    audioTransferProgress: {},
    eventListeners: [],

    connect: (url) => {
        const currentState = get();

        // Evitar múltiples conexiones
        if (currentState.connecting || currentState.status.connected) {
            console.log('⚠️ Ya conectado o conectando, ignorando nueva conexión');
            return;
        }

        console.log('🔗 Iniciando conexión WebSocket a:', url);
        set({ connecting: true, error: null });

        esp32WebSocketService.connect(url);

        esp32WebSocketService.onMessage((msg) => {
            console.log('📥 Mensaje recibido en store:', msg);

            const currentState = get();
            const categoryNames = {
                1: 'Básico',
                2: 'Emociones',
                3: 'Necesidades',
                4: 'Familia',
                5: 'Emergencia',
                6: 'Escuela',
                7: 'Comida',
                8: 'Juegos'
            };

            if (msg.type === 'esp32_status' || msg.type === 'status_response') {
                set({
                    status: {
                        ...msg,
                        connected: msg.connected ?? msg.esp32_connected ?? false
                    },
                    connecting: false
                });
            }
            else if (msg.type === 'button_pressed') {
                // Emitir evento a los listeners
                const buttonEvent = {
                    button: msg.button,
                    category: msg.category,
                    messageId: msg.messageId,
                    audioFile: msg.audioFile,
                    timestamp: msg.timestamp,
                    categoryName: categoryNames[msg.category as keyof typeof categoryNames] || `Categoría ${msg.category}`
                };

                currentState.eventListeners.forEach(listener => {
                    listener.onButtonPressed?.(buttonEvent);
                });

                console.log('🔘 Evento de botón emitido a listeners:', buttonEvent);
            }
            else if (msg.type === 'category_changed') {
                // Emitir evento a los listeners
                const categoryEvent = {
                    category: msg.category,
                    categoryName: msg.categoryName,
                    timestamp: msg.timestamp
                };

                currentState.eventListeners.forEach(listener => {
                    listener.onCategoryChanged?.(categoryEvent);
                });

                console.log('📁 Evento de categoría emitido a listeners:', categoryEvent);
            }
            else if (msg.type === 'heartbeat') {
                // Emitir evento a los listeners
                const heartbeatEvent = {
                    battery: msg.battery,
                    system_on: msg.system_on,
                    category: msg.category,
                    timestamp: msg.timestamp
                };

                currentState.eventListeners.forEach(listener => {
                    listener.onHeartbeat?.(heartbeatEvent);
                });

                console.log('💓 Evento de heartbeat emitido a listeners:', heartbeatEvent);

                // También actualizar el status
                set({
                    status: {
                        ...currentState.status,
                        battery: msg.battery,
                        category: msg.category,
                        system_on: msg.system_on,
                        lastHeartbeat: Date.now()
                    }
                });
            }
            else if (msg.type === 'esp32_connected') {
                set({
                    status: {
                        ...get().status,
                        connected: true
                    },
                    connecting: false,
                    error: null
                });
            }
            else if (msg.type === 'admin_panel_connected') {
                console.log('✅ AdminPanel conectado - marcando sistema como disponible');
                set({
                    status: {
                        ...get().status,
                        connected: true
                    },
                    connecting: false,
                    error: null
                });
            }
            else if (msg.type === 'esp32_disconnected') {
                set({
                    status: {
                        ...get().status,
                        connected: false
                    },
                    connecting: false
                });
            }
            else if (msg.type === 'system_state_changed') {
                console.log('🔋 System state changed:', msg.system_on ? 'ON' : 'OFF');
                set({
                    status: {
                        ...get().status,
                        system_on: msg.system_on,
                        battery: msg.battery,
                        category: msg.category
                    }
                });
            }
            else if (msg.type === 'error') {
                // NO mostrar errores en la UI, solo logear
                console.log('⚠️ WebSocket error received:', msg.message);
                set({
                    connecting: false
                });
            }
            else if (msg.type === 'audio_transfer_progress') {
                set((state) => ({
                    audioTransferProgress: {
                        ...state.audioTransferProgress,
                        [msg.filename]: msg.progress
                    }
                }));
            }
            else if (msg.type === 'audio_transfer_complete') {
                console.log('✅ Audio transfer completed:', msg.filename);
                set((state) => ({
                    audioTransferProgress: {
                        ...state.audioTransferProgress,
                        [msg.filename]: 100
                    }
                }));
            }
        });
    },

    disconnect: () => {
        esp32WebSocketService.disconnect();
        set({ status: { connected: false }, connecting: false, audioTransferProgress: {} });
    },

    sendCommand: (msg) => {
        esp32WebSocketService.send(msg);
    },

    /**
     * Transferir archivo de audio al ESP32
     */
    transferAudioFile: async (audioData: any): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const { status } = get();

            if (!status.connected) {
                reject(new Error('ESP32 no está conectado'));
                return;
            }

            console.log('🎵 Starting audio transfer:', audioData.targetFilename);

            // Establecer progreso inicial
            set((state) => ({
                audioTransferProgress: {
                    ...state.audioTransferProgress,
                    [audioData.targetFilename]: 0
                }
            }));

            // Enviar comando de transferencia
            esp32WebSocketService.send({
                type: 'transfer_audio',
                filename: audioData.targetFilename,
                audioData: audioData.audioData,
                messageId: audioData.messageId,
                messageText: audioData.messageText,
                categoryName: audioData.categoryName,
                audioSize: audioData.audioSize,
                createdBy: audioData.createdBy
            });

            // Configurar listener temporal para la respuesta
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout: Transfer took too long'));
            }, 30000); // 30 segundos timeout

            const transferListener = (msg: any) => {
                if (msg.type === 'audio_transfer_complete' && msg.filename === audioData.targetFilename) {
                    clearTimeout(timeoutId);
                    resolve(true);
                } else if (msg.type === 'audio_transfer_error' && msg.filename === audioData.targetFilename) {
                    clearTimeout(timeoutId);
                    reject(new Error(msg.error || 'Transfer failed'));
                }
            };

            esp32WebSocketService.onMessage(transferListener);
        });
    },

    /**
     * Configurar botón con archivo de audio (descarga + asignación)
     */
    configureButtonWithAudio: async (buttonNumber: number, audioData: any): Promise<boolean> => {
        try {
            console.log(`🔘 Configuring button ${buttonNumber} with audio:`, audioData.messageText);

            // Por ahora, solo configuramos el botón sin transferir el archivo
            // TODO: Implementar transferencia de audio cuando el ESP32 esté listo
            console.log('⚠️ Skipping audio transfer - ESP32 not yet configured for file transfer');

            // Configurar botón para usar el archivo (ESP32 usará archivo local existente)
            esp32WebSocketService.send({
                type: 'configure_button',
                button: buttonNumber,
                audioFile: audioData.targetFilename,
                messageId: audioData.messageId,
                messageText: audioData.messageText,
                categoryName: audioData.categoryName
            });

            console.log(`✅ Button ${buttonNumber} configured successfully (using local audio)`);
            return true;
        } catch (error) {
            
            throw error;
        }
    },

    /**
     * Configurar botón con transferencia de audio completa (para futuro uso)
     */
    configureButtonWithFullAudioTransfer: async (buttonNumber: number, audioData: any): Promise<boolean> => {
        try {
            console.log(`🔘 Configuring button ${buttonNumber} with full audio transfer:`, audioData.messageText);

            // Paso 1: Transferir archivo de audio
            await get().transferAudioFile(audioData);

            // Paso 2: Configurar botón para usar el archivo
            esp32WebSocketService.send({
                type: 'configure_button',
                button: buttonNumber,
                audioFile: audioData.targetFilename,
                messageId: audioData.messageId,
                messageText: audioData.messageText,
                categoryName: audioData.categoryName
            });

            console.log(`✅ Button ${buttonNumber} configured successfully with full transfer`);
            return true;
        } catch (error) {
            
            throw error;
        }
    },

    // Event listener management
    addEventListener: (listener: ESP32EventListener) => {
        set(state => ({
            eventListeners: [...state.eventListeners, listener]
        }));

        // Return unsubscribe function
        return () => {
            set(state => ({
                eventListeners: state.eventListeners.filter(l => l !== listener)
            }));
        };
    },

    removeEventListener: (listener: ESP32EventListener) => {
        set(state => ({
            eventListeners: state.eventListeners.filter(l => l !== listener)
        }));
    }
}));