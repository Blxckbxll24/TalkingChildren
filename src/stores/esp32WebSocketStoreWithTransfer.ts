import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import esp32WebSocketService, { ESP32WebSocketListener, ESP32Status, AudioTransferProgress } from '../services/esp32WebSocketServiceWithTransfer';

export interface AudioTransferState {
    filename: string;
    progress: number;
    bytesTransferred: number;
    totalBytes: number;
    inProgress: boolean;
    error?: string;
}

// Event types for the monitor
export interface ESP32EventListener {
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
}

export interface ESP32Store {
    // Connection state
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;

    // ESP32 status
    esp32Status: ESP32Status | null;
    lastStatusUpdate: number;

    // Audio transfer
    audioTransfer: AudioTransferState;
    transferHistory: string[];

    // Event listeners for monitor
    eventListeners: ESP32EventListener[];

    // Actions
    connect: (url: string) => Promise<boolean>;
    disconnect: () => void;
    sendCommand: (command: any) => boolean;

    // Event subscription
    addEventListener: (listener: ESP32EventListener) => () => void;
    removeEventListener: (listener: ESP32EventListener) => void;

    // Audio transfer actions
    transferAudioToESP32: (audioData: string, filename: string, messageId: number, messageText: string, categoryName: string) => Promise<boolean>;
    configureButtonWithAudio: (button: number, messageId: number, messageText: string, categoryName: string, audioFile: string) => boolean;
    playButton: (button: number) => boolean;
    changeCategory: (category: number) => boolean;
    requestStatus: () => boolean;

    // Internal state management
    setConnectionState: (connected: boolean, connecting: boolean) => void;
    setConnectionError: (error: string | null) => void;
    updateESP32Status: (status: ESP32Status) => void;
    updateAudioTransferProgress: (progress: AudioTransferProgress) => void;
    completeAudioTransfer: (filename: string, success: boolean, error?: string) => void;
    resetAudioTransfer: () => void;
}

export const useESP32StoreWithTransfer = create<ESP32Store>()(
    subscribeWithSelector((set, get) => {
        // WebSocket listener implementation
        const webSocketListener: ESP32WebSocketListener = {
            onConnectionStateChange: (connected: boolean) => {
                console.log(`📡 ESP32Store: Connection state changed: ${connected}`);
                set({
                    isConnected: connected,
                    isConnecting: false,
                    connectionError: connected ? null : 'Disconnected'
                });
            },

            onStatusUpdate: (status: ESP32Status) => {
                console.log('📊 ESP32Store: Status update received:', status);
                set({
                    esp32Status: status,
                    lastStatusUpdate: Date.now()
                });
            },

            onMessage: (message) => {
                console.log('📨 ESP32Store: Message received:', message.type);

                const state = get();
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

                // Emit events to listeners
                if (message.type === 'button_pressed') {
                    const buttonEvent = {
                        button: message.button,
                        category: message.category,
                        messageId: message.messageId,
                        audioFile: message.audioFile,
                        timestamp: message.timestamp,
                        categoryName: categoryNames[message.category as keyof typeof categoryNames] || `Categoría ${message.category}`
                    };

                    state.eventListeners.forEach(listener => {
                        listener.onButtonPressed?.(buttonEvent);
                    });
                } else if (message.type === 'category_changed') {
                    const categoryEvent = {
                        category: message.category,
                        categoryName: message.categoryName,
                        timestamp: message.timestamp
                    };

                    state.eventListeners.forEach(listener => {
                        listener.onCategoryChanged?.(categoryEvent);
                    });
                } else if (message.type === 'heartbeat') {
                    const heartbeatEvent = {
                        battery: message.battery,
                        system_on: message.system_on,
                        category: message.category,
                        timestamp: message.timestamp
                    };

                    state.eventListeners.forEach(listener => {
                        listener.onHeartbeat?.(heartbeatEvent);
                    });
                }
            },

            onError: (error: string) => {
                console.error('❌ ESP32Store: WebSocket error:', error);
                set({
                    connectionError: error,
                    isConnecting: false
                });
            },

            onAudioTransferProgress: (progress: AudioTransferProgress) => {
                console.log(`🎵 ESP32Store: Audio transfer progress: ${progress.progress}%`);
                set({
                    audioTransfer: {
                        filename: progress.filename,
                        progress: progress.progress,
                        bytesTransferred: progress.bytesTransferred,
                        totalBytes: progress.totalBytes,
                        inProgress: true
                    }
                });
            },

            onAudioTransferComplete: (filename: string, success: boolean, error?: string) => {
                console.log(`🎵 ESP32Store: Audio transfer ${success ? 'completed' : 'failed'}: ${filename}`);

                if (success) {
                    set(state => ({
                        audioTransfer: {
                            filename,
                            progress: 100,
                            bytesTransferred: state.audioTransfer.totalBytes,
                            totalBytes: state.audioTransfer.totalBytes,
                            inProgress: false
                        },
                        transferHistory: [...state.transferHistory, filename]
                    }));
                } else {
                    set({
                        audioTransfer: {
                            filename,
                            progress: 0,
                            bytesTransferred: 0,
                            totalBytes: 0,
                            inProgress: false,
                            error: error || 'Transfer failed'
                        }
                    });
                }
            }
        };

        // Add listener to service
        esp32WebSocketService.addListener(webSocketListener);

        return {
            // Initial state
            isConnected: false,
            isConnecting: false,
            connectionError: null,
            esp32Status: null,
            lastStatusUpdate: 0,
            audioTransfer: {
                filename: '',
                progress: 0,
                bytesTransferred: 0,
                totalBytes: 0,
                inProgress: false
            },
            transferHistory: [],
            eventListeners: [],

            // Actions
            connect: async (url: string): Promise<boolean> => {
                try {
                    set({ isConnecting: true, connectionError: null });
                    console.log(`🔌 ESP32Store: Connecting to ${url}...`);

                    const success = await esp32WebSocketService.connect(url);

                    if (!success) {
                        set({
                            isConnecting: false,
                            connectionError: 'Failed to connect to ESP32'
                        });
                    }

                    return success;
                } catch (error) {
                    console.error('❌ ESP32Store: Connection error:', error);
                    set({
                        isConnecting: false,
                        connectionError: error instanceof Error ? error.message : 'Unknown connection error'
                    });
                    return false;
                }
            },

            disconnect: () => {
                console.log('🔌 ESP32Store: Disconnecting...');
                esp32WebSocketService.disconnect();
                set({
                    isConnected: false,
                    isConnecting: false,
                    connectionError: null,
                    esp32Status: null
                });
            },

            sendCommand: (command: any): boolean => {
                return esp32WebSocketService.sendMessage(command);
            },

            // Audio transfer methods
            transferAudioToESP32: async (
                audioData: string,
                filename: string,
                messageId: number,
                messageText: string,
                categoryName: string
            ): Promise<boolean> => {
                try {
                    console.log(`🎵 ESP32Store: Starting audio transfer: ${filename}`);

                    // Reset transfer state
                    set({
                        audioTransfer: {
                            filename,
                            progress: 0,
                            bytesTransferred: 0,
                            totalBytes: audioData.length,
                            inProgress: true,
                            error: undefined
                        }
                    });

                    // Calculate estimated size
                    const estimatedSize = Math.floor((audioData.length * 3) / 4); // Base64 to binary estimation

                    const success = esp32WebSocketService.transferAudio(
                        audioData,
                        filename,
                        messageId,
                        messageText,
                        categoryName,
                        estimatedSize
                    );

                    if (!success) {
                        set({
                            audioTransfer: {
                                filename,
                                progress: 0,
                                bytesTransferred: 0,
                                totalBytes: 0,
                                inProgress: false,
                                error: 'Failed to send transfer command'
                            }
                        });
                    }

                    return success;
                } catch (error) {
                    console.error('❌ ESP32Store: Audio transfer error:', error);
                    set({
                        audioTransfer: {
                            filename,
                            progress: 0,
                            bytesTransferred: 0,
                            totalBytes: 0,
                            inProgress: false,
                            error: error instanceof Error ? error.message : 'Unknown transfer error'
                        }
                    });
                    return false;
                }
            },

            configureButtonWithAudio: (
                button: number,
                messageId: number,
                messageText: string,
                categoryName: string,
                audioFile: string
            ): boolean => {
                console.log(`🔘 ESP32Store: Configuring button ${button} with ${audioFile}`);
                return esp32WebSocketService.configureButton(button, messageId, messageText, categoryName, audioFile);
            },

            playButton: (button: number): boolean => {
                console.log(`🔊 ESP32Store: Playing button ${button}`);
                return esp32WebSocketService.playAudio(button);
            },

            changeCategory: (category: number): boolean => {
                console.log(`📁 ESP32Store: Changing category to ${category}`);
                return esp32WebSocketService.changeCategory(category);
            },

            requestStatus: (): boolean => {
                console.log('📊 ESP32Store: Requesting status');
                return esp32WebSocketService.requestStatus();
            },

            // Internal state management
            setConnectionState: (connected: boolean, connecting: boolean) => {
                set({ isConnected: connected, isConnecting: connecting });
            },

            setConnectionError: (error: string | null) => {
                set({ connectionError: error });
            },

            updateESP32Status: (status: ESP32Status) => {
                set({
                    esp32Status: status,
                    lastStatusUpdate: Date.now()
                });
            },

            updateAudioTransferProgress: (progress: AudioTransferProgress) => {
                set({
                    audioTransfer: {
                        filename: progress.filename,
                        progress: progress.progress,
                        bytesTransferred: progress.bytesTransferred,
                        totalBytes: progress.totalBytes,
                        inProgress: true
                    }
                });
            },

            completeAudioTransfer: (filename: string, success: boolean, error?: string) => {
                if (success) {
                    set(state => ({
                        audioTransfer: {
                            filename,
                            progress: 100,
                            bytesTransferred: state.audioTransfer.totalBytes,
                            totalBytes: state.audioTransfer.totalBytes,
                            inProgress: false
                        },
                        transferHistory: [...state.transferHistory, filename]
                    }));
                } else {
                    set({
                        audioTransfer: {
                            filename,
                            progress: 0,
                            bytesTransferred: 0,
                            totalBytes: 0,
                            inProgress: false,
                            error: error || 'Transfer failed'
                        }
                    });
                }
            },

            resetAudioTransfer: () => {
                set({
                    audioTransfer: {
                        filename: '',
                        progress: 0,
                        bytesTransferred: 0,
                        totalBytes: 0,
                        inProgress: false,
                        error: undefined
                    }
                });
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
        };
    })
);
