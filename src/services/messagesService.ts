// src/services/messagesService.ts
import { authService } from './authService';
import { API_BASE_URL } from '../config/env';

export interface Message {
    id: number;
    text: string;
    audio_url: string;
    category_id: number;
    created_by: number;
    is_active: number;
    created_at: string;
    updated_at: string;
    category_name: string;
    creator_name: string;
}

export interface MessagesResponse {
    success: boolean;
    data: Message[];
    message: string;
}

class MessagesService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getMessages(): Promise<Message[]> {
        try {
            console.log('🔍 Fetching messages from:', this.baseUrl);

            const token = await authService.getToken();
            console.log('🔑 Token status:', token ? 'Found' : 'Not found');

            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('📡 Making request to:', `${this.baseUrl}/api/messages`);

            const response = await fetch(`${this.baseUrl}/api/messages`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result: MessagesResponse = await response.json();
            console.log('✅ Messages loaded:', result.data?.length || 0);

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Error al obtener mensajes');
            }
        } catch (error: any) {
            

            // Provide more specific error messages
            if (error.message?.includes('Network request failed')) {
                throw new Error(`No se puede conectar al servidor en ${this.baseUrl}. Verifica que el backend esté ejecutándose y sea accesible desde el dispositivo.`);
            } else if (error.message?.includes('timeout')) {
                throw new Error('Timeout: El servidor tardó demasiado en responder');
            } else if (error.message?.includes('No authentication token')) {
                throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
            }

            throw error;
        }
    }

    async getMessagesByCategory(categoryId: number): Promise<Message[]> {
        const messages = await this.getMessages();
        return messages.filter(message => message.category_id === categoryId);
    }

    async getActiveMessages(): Promise<Message[]> {
        const messages = await this.getMessages();
        return messages.filter(message => message.is_active === 1);
    }

    async getMessagesGroupedByCategory(): Promise<{ [categoryName: string]: Message[] }> {
        const messages = await this.getActiveMessages();
        const grouped: { [categoryName: string]: Message[] } = {};

        messages.forEach(message => {
            if (!grouped[message.category_name]) {
                grouped[message.category_name] = [];
            }
            grouped[message.category_name].push(message);
        });

        return grouped;
    }

    /**
     * Descargar archivo de audio desde el backend
     * @param audioUrl - URL del archivo de audio (puede ser relativa)
     * @returns ArrayBuffer con los datos del audio
     */
    async downloadAudioFile(audioUrl: string): Promise<ArrayBuffer> {
        try {
            const token = await authService.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Construir URL completa si es relativa
            const fullUrl = audioUrl.startsWith('http')
                ? audioUrl
                : `${this.baseUrl}${audioUrl}`;

            console.log('🎵 Downloading audio from:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to download audio: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            console.log('✅ Audio downloaded, size:', arrayBuffer.byteLength, 'bytes');

            return arrayBuffer;
        } catch (error) {
            
            throw error;
        }
    }

    /**
     * Convertir ArrayBuffer a Base64 para transmisión
     * @param buffer - ArrayBuffer del archivo de audio
     * @returns String en base64
     */
    arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Preparar datos de audio para envío al ESP32
     * @param message - Mensaje con información del audio
     * @param targetFilename - Nombre del archivo destino en microSD (ej: "001.wav")
     * @returns Objeto con datos para enviar al ESP32
     */
    async prepareAudioForESP32(message: Message, targetFilename: string) {
        try {
            console.log('🔄 Preparing audio for ESP32:', message.text, '→', targetFilename);

            // Descargar el archivo de audio
            const audioBuffer = await this.downloadAudioFile(message.audio_url);

            // Convertir a base64 para transmisión
            const audioBase64 = this.arrayBufferToBase64(audioBuffer);

            return {
                messageId: message.id,
                messageText: message.text,
                categoryName: message.category_name,
                targetFilename: targetFilename,
                audioData: audioBase64,
                audioSize: audioBuffer.byteLength,
                createdBy: message.creator_name
            };
        } catch (error) {
            
            throw error;
        }
    }
}

export const messagesService = new MessagesService();
