// ESP32 WebSocket Service with Audio Transfer Support
export interface AudioTransferProgress {
    filename: string;
    progress: number;
    bytesTransferred: number;
    totalBytes: number;
}

export interface ESP32Status {
    connected: boolean;
    battery?: number;
    category?: number;
    mp3_ready?: boolean;
    sd_ready?: boolean;
    audio_transfer?: boolean;
    bootCount?: number;
    uptime?: number;
    wifi_rssi?: number;
    free_heap?: number;
    buttons?: Array<{
        number: number;
        configured: boolean;
        audioFile: string;
        fileNumber: number;
        messageText: string;
        categoryName: string;
    }>;
    lastHeartbeat?: number;
}

export interface ESP32WebSocketMessage {
    type: string;
    [key: string]: any;
}

export interface ESP32WebSocketListener {
    onConnectionStateChange: (connected: boolean) => void;
    onStatusUpdate: (status: ESP32Status) => void;
    onMessage: (message: ESP32WebSocketMessage) => void;
    onError: (error: string) => void;
    onAudioTransferProgress?: (progress: AudioTransferProgress) => void;
    onAudioTransferComplete?: (filename: string, success: boolean, error?: string) => void;
}

class ESP32WebSocketService {
    private ws: WebSocket | null = null;
    private listeners: ESP32WebSocketListener[] = [];
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isConnected = false;
    private lastConnectionAttempt = 0;
    private reconnectDelay = 5000;
    private maxReconnectDelay = 30000;
    private reconnectAttempts = 0;

    connect(url: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            console.log(`🔌 ESP32WebSocketService: Connecting to ${url}`);

            // Prevent duplicate connections
            if (this.isConnecting || this.isConnected) {
                console.log('⚠️ ESP32WebSocketService: Already connecting or connected');
                resolve(this.isConnected);
                return;
            }

            // Rate limiting
            const now = Date.now();
            if (now - this.lastConnectionAttempt < 1000) {
                console.log('⚠️ ESP32WebSocketService: Rate limited');
                reject(new Error('Rate limited'));
                return;
            }

            this.lastConnectionAttempt = now;
            this.isConnecting = true;

            try {
                this.ws = new WebSocket(url);

                const timeout = setTimeout(() => {
                    console.log('⏰ ESP32WebSocketService: Connection timeout');
                    this.isConnecting = false;
                    if (this.ws) {
                        this.ws.close();
                        this.ws = null;
                    }
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 5000;

                    console.log('✅ ESP32WebSocketService: Connected successfully');
                    this.notifyListeners('onConnectionStateChange', true);

                    // Send initial identification
                    this.sendMessage({
                        type: 'connection',
                        device: 'ReactNative_TalkingApp',
                        version: '1.0'
                    });

                    resolve(true);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log('📨 ESP32WebSocketService: Received:', message.type);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('❌ ESP32WebSocketService: Parse error:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    this.isConnected = false;
                    this.ws = null;

                    console.log(`🔌 ESP32WebSocketService: Disconnected (${event.code}: ${event.reason})`);
                    this.notifyListeners('onConnectionStateChange', false);

                    // Auto-reconnect
                    this.scheduleReconnect(url);

                    if (this.reconnectAttempts === 0) {
                        resolve(false);
                    }
                };

                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    this.isConnecting = false;

                    console.error('❌ ESP32WebSocketService: Connection error:', error);
                    this.notifyListeners('onError', 'Connection failed');

                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    }
                };

            } catch (error) {
                this.isConnecting = false;
                console.error('❌ ESP32WebSocketService: Setup error:', error);
                reject(error);
            }
        });
    }

    private handleMessage(message: ESP32WebSocketMessage) {
        this.notifyListeners('onMessage', message);

        switch (message.type) {
            case 'esp32_status':
                // Convertir de forma segura a ESP32Status
                const status: ESP32Status = {
                    connected: Boolean(message.connected),
                    battery: message.battery,
                    category: message.category,
                    mp3_ready: message.mp3_ready,
                    sd_ready: message.sd_ready,
                    audio_transfer: message.audio_transfer,
                    bootCount: message.bootCount,
                    uptime: message.uptime,
                    wifi_rssi: message.wifi_rssi,
                    free_heap: message.free_heap,
                    buttons: message.buttons,
                    lastHeartbeat: Date.now()
                };
                this.notifyListeners('onStatusUpdate', status);
                break;

            case 'audio_transfer_progress':
                if (this.hasListenerMethod('onAudioTransferProgress')) {
                    const progress: AudioTransferProgress = {
                        filename: message.filename,
                        progress: message.progress,
                        bytesTransferred: message.bytesTransferred,
                        totalBytes: message.totalBytes
                    };
                    this.notifyListeners('onAudioTransferProgress', progress);
                }
                break;

            case 'audio_transfer_complete':
                if (this.hasListenerMethod('onAudioTransferComplete')) {
                    this.notifyListeners('onAudioTransferComplete',
                        message.filename,
                        message.success,
                        message.error
                    );
                }
                break;

            case 'audio_transfer_error':
                if (this.hasListenerMethod('onAudioTransferComplete')) {
                    this.notifyListeners('onAudioTransferComplete',
                        message.filename,
                        false,
                        message.error
                    );
                }
                break;

            case 'button_configured':
                console.log(`✅ Button ${message.button} configured with ${message.audioFile}`);
                break;

            case 'audio_playback':
                console.log(`🔊 Audio played: ${message.audioFile} (Button ${message.button})`);
                break;

            case 'category_changed':
                console.log(`📁 Category changed to ${message.category}: ${message.categoryName}`);
                break;
        }
    }

    private hasListenerMethod(methodName: keyof ESP32WebSocketListener): boolean {
        return this.listeners.some(listener =>
            typeof listener[methodName] === 'function'
        );
    }

    private scheduleReconnect(url: string) {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, this.maxReconnectDelay);

        console.log(`🔄 ESP32WebSocketService: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        this.reconnectTimer = setTimeout(() => {
            this.connect(url).catch(error => {
                console.error('❌ ESP32WebSocketService: Reconnection failed:', error);
            });
        }, delay);
    }

    disconnect() {
        console.log('🔌 ESP32WebSocketService: Disconnecting...');

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.isConnected = false;

        if (this.ws) {
            this.ws.close(1000, 'Manual disconnect');
            this.ws = null;
        }

        this.notifyListeners('onConnectionStateChange', false);
    }

    sendMessage(message: ESP32WebSocketMessage): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ ESP32WebSocketService: Cannot send message - not connected');
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            console.log(`📤 ESP32WebSocketService: Sent ${message.type}`);
            return true;
        } catch (error) {
            console.error('❌ ESP32WebSocketService: Send error:', error);
            return false;
        }
    }

    // Audio Transfer Methods
    transferAudio(audioData: string, filename: string, messageId: number, messageText: string, categoryName: string, audioSize: number): boolean {
        return this.sendMessage({
            type: 'transfer_audio',
            audioData,
            filename,
            messageId,
            messageText,
            categoryName,
            audioSize
        });
    }

    configureButton(button: number, messageId: number, messageText: string, categoryName: string, audioFile: string): boolean {
        return this.sendMessage({
            type: 'configure_button',
            button,
            messageId,
            messageText,
            categoryName,
            audioFile
        });
    }

    playAudio(button: number): boolean {
        return this.sendMessage({
            type: 'play_audio',
            button
        });
    }

    changeCategory(category: number): boolean {
        return this.sendMessage({
            type: 'change_category',
            category
        });
    }

    requestStatus(): boolean {
        return this.sendMessage({
            type: 'get_status'
        });
    }

    ping(): boolean {
        return this.sendMessage({
            type: 'ping',
            timestamp: Date.now()
        });
    }

    addListener(listener: ESP32WebSocketListener) {
        this.listeners.push(listener);
        console.log(`👂 ESP32WebSocketService: Listener added (${this.listeners.length} total)`);
    }

    removeListener(listener: ESP32WebSocketListener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
            console.log(`👂 ESP32WebSocketService: Listener removed (${this.listeners.length} remaining)`);
        }
    }

    private notifyListeners(method: keyof ESP32WebSocketListener, ...args: any[]) {
        this.listeners.forEach(listener => {
            try {
                const fn = listener[method] as Function;
                if (typeof fn === 'function') {
                    fn.apply(listener, args);
                }
            } catch (error) {
                console.error(`❌ ESP32WebSocketService: Listener error (${method}):`, error);
            }
        });
    }

    isConnectedState(): boolean {
        return this.isConnected;
    }

    isConnectingState(): boolean {
        return this.isConnecting;
    }

    getConnectionState(): 'connected' | 'connecting' | 'disconnected' {
        if (this.isConnected) return 'connected';
        if (this.isConnecting) return 'connecting';
        return 'disconnected';
    }
}

export const esp32WebSocketService = new ESP32WebSocketService();
export default esp32WebSocketService;
