import apiClient from './apiClient';
import { Message, ApiResponse, CreateMessageDTO, UpdateMessageDTO } from '../types/api';

export class MessageService {
    /**
     * Obtener lista de mensajes
     */
    async getAllMessages(): Promise<Message[]> {
        try {
            const response = await apiClient.get<ApiResponse<Message[]>>('/messages');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mensajes:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes propios del usuario
     */
    async getMyMessages(): Promise<Message[]> {
        try {
            const response = await apiClient.get<ApiResponse<Message[]>>('/messages/my-messages');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mis mensajes:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensaje específico por ID
     */
    async getMessageById(id: number): Promise<Message> {
        try {
            const response = await apiClient.get<ApiResponse<Message>>(`/messages/${id}`);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Mensaje no encontrado');
        } catch (error: any) {
            console.error('Error obteniendo mensaje:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Crear nuevo mensaje (genera audio TTS automáticamente)
     */
    async createMessage(messageData: CreateMessageDTO): Promise<Message> {
        try {
            const response = await apiClient.post<ApiResponse<Message>>('/messages', messageData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error creando mensaje');
        } catch (error: any) {
            console.error('Error creando mensaje:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Actualizar mensaje existente (regenera audio TTS si cambia el texto)
     */
    async updateMessage(id: number, messageData: UpdateMessageDTO): Promise<Message> {
        try {
            const response = await apiClient.put<ApiResponse<Message>>(`/messages/${id}`, messageData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error actualizando mensaje');
        } catch (error: any) {
            console.error('Error actualizando mensaje:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Eliminar mensaje
     */
    async deleteMessage(id: number): Promise<boolean> {
        try {
            const response = await apiClient.delete<ApiResponse>(`/messages/${id}`);
            return response.success;
        } catch (error: any) {
            console.error('Error eliminando mensaje:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes por categoría
     */
    async getMessagesByCategory(categoryId: number): Promise<Message[]> {
        try {
            const response = await apiClient.get<ApiResponse<Message[]>>(`/messages/category/${categoryId}`);
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mensajes por categoría:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Regenerar audio TTS de un mensaje
     */
    async regenerateAudio(id: number): Promise<Message> {
        try {
            const response = await apiClient.post<ApiResponse<Message>>(`/messages/${id}/regenerate-audio`);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error regenerando audio');
        } catch (error: any) {
            console.error('Error regenerando audio:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener URL del archivo de audio para reproducir
     */
    async getAudioUrl(id: number): Promise<string> {
        try {
            const message = await this.getMessageById(id);
            if (message.audio_url) {
                // Devolver la URL completa del audio desde el endpoint del backend
                return `/messages/${id}/audio`;
            }
            throw new Error('Audio no disponible para este mensaje');
        } catch (error: any) {
            console.error('Error obteniendo URL de audio:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener estadísticas de mensajes
     */
    async getMessageStats(): Promise<{
        total: number;
        byCategory: { [key: string]: number };
        recent: Message[];
    }> {
        try {
            const messages = await this.getAllMessages();
            const total = messages.length;

            const byCategory = messages.reduce((acc, message) => {
                const categoryName = message.category_name || 'Sin categoría';
                acc[categoryName] = (acc[categoryName] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number });

            const recent = messages
                .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                .slice(0, 5);

            return {
                total,
                byCategory,
                recent
            };
        } catch (error: any) {
            console.error('Error obteniendo estadísticas:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Manejar errores de la API
     */
    private handleError(error: any): Error {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }
        if (error.message) {
            return new Error(error.message);
        }
        return new Error('Error desconocido en el servicio de mensajes');
    }
}

export const messageService = new MessageService();
