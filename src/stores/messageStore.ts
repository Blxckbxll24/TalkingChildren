import { create } from 'zustand';
import { Message, ApiResponse } from '../types/api';
import { API_BASE_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MessageStore {
    messages: Message[];
    loading: boolean;
    error: string | null;
    fetchMessages: () => Promise<void>;
    downloadAudioAsBase64: (messageId: number) => Promise<string | null>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
    messages: [],
    loading: false,
    error: null,

    fetchMessages: async () => {
        try {
            set({ loading: true, error: null });

            // Get auth token
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Token de autenticación no encontrado');
            }

            // Call real API endpoint
            const response = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: ApiResponse<Message[]> = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al obtener mensajes');
            }

            // Transform API response to ensure proper types
            const messages: Message[] = (data.data || []).map(msg => ({
                ...msg,
                is_active: Boolean(msg.is_active), // Convert 1/0 to boolean
            }));

            console.log(`✅ Mensajes cargados: ${messages.length} mensajes`);
            set({ messages, loading: false });
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
            set({
                error: error instanceof Error ? error.message : 'Error desconocido',
                loading: false
            });
        }
    },

    downloadAudioAsBase64: async (messageId: number): Promise<string | null> => {
        try {
            const message = get().messages.find(m => m.id === messageId);
            if (!message) {
                throw new Error('Mensaje no encontrado');
            }

            if (!message.audio_url) {
                throw new Error('El mensaje no tiene archivo de audio');
            }

            // Get auth token
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Token de autenticación no encontrado');
            }

            console.log(`🎵 Descargando audio para mensaje ${messageId}: ${message.audio_url}`);

            // Use the dedicated audio download endpoint
            const audioUrl = `${API_BASE_URL}/api/messages/${messageId}/audio`;

            const response = await fetch(audioUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error descargando audio: ${response.status}`);
            }

            // Convert response to ArrayBuffer
            const arrayBuffer = await response.arrayBuffer();

            // Convert ArrayBuffer to base64
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }

            const base64Audio = btoa(binaryString);

            console.log(`✅ Audio descargado: ${base64Audio.length} caracteres base64`);
            return base64Audio;
        } catch (error) {
            console.error('❌ Error downloading audio:', error);
            return null;
        }
    },
}));
