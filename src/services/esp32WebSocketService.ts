type ESP32Status = {
    connected: boolean;
    battery?: number;
    category?: number;
    lastHeartbeat?: number;
};

type WSMessage = {
    type: string;
    [key: string]: any;
};

type Listener = (msg: WSMessage) => void;

class ESP32WebSocketService {
    private ws: WebSocket | null = null;
    private listeners: Listener[] = [];
    private url: string = '';
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isConnecting: boolean = false;

    connect(url: string) {
        // Evitar conexiones duplicadas
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            console.log('⚠️ WebSocket ya conectado o conectando, ignorando nueva conexión');
            return;
        }

        if (this.isConnecting) {
            console.log('⚠️ Conexión ya en progreso, ignorando nueva conexión');
            return;
        }

        this.isConnecting = true;
        this.url = url;

        console.log('🔗 Conectando WebSocket a:', url);

        // Limpiar timer de reconexión anterior
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('✅ WebSocket conectado al servidor');
                this.isConnecting = false;
                this.send({ type: 'connection', device: 'AdminPanel' });

                // Notificar que la conexión AdminPanel está lista
                this.notifyListeners({
                    type: 'admin_panel_connected',
                    connected: true,
                    message: 'AdminPanel conectado al servidor WebSocket'
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    console.log('📥 WebSocket mensaje recibido:', msg);
                    this.notifyListeners(msg);
                } catch (error) {
                    
                }
            };

            this.ws.onclose = (event) => {
                console.log('🔌 WebSocket cerrado:', event.code, event.reason);
                this.isConnecting = false;
                this.notifyListeners({ type: 'esp32_disconnected', connected: false });

                // NO hacer auto-reconexión automática
                // Solo conectar cuando el usuario lo solicite explícitamente
            };

            this.ws.onerror = (error) => {
                
                this.isConnecting = false;
                // NO notificar errores de red a la UI
                // Solo loggear para debugging
            };

        } catch (error) {
            
            this.isConnecting = false;
            // NO notificar errores de red a la UI
            // Solo loggear para debugging
        }
    }

    disconnect() {
        console.log('🔌 Desconectando WebSocket...');

        // Limpiar timer de reconexión
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.isConnecting = false;

        if (this.ws) {
            this.ws.close(1000, 'Desconexión manual');
            this.ws = null;
        }
    }

    send(msg: WSMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('📤', msg.type);
            this.ws.send(JSON.stringify(msg));
        } else {
            console.warn('⚠️ WebSocket desconectado:', msg.type);
        }
    }

    onMessage(cb: Listener) {
        this.listeners.push(cb);
    }

    private notifyListeners(msg: WSMessage) {
        this.listeners.forEach((cb) => {
            try {
                cb(msg);
            } catch (error) {
                
            }
        });
    }

    getReadyState(): number {
        return this.ws?.readyState ?? WebSocket.CLOSED;
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

export const esp32WebSocketService = new ESP32WebSocketService();