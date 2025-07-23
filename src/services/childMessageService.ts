import apiClient from './apiClient';
import {
    ChildMessage,
    Message,
    AssignMessageRequest,
    UpdateChildMessageRequest,
    ApiResponse
} from '../types/api';

export class ChildMessageService {
    /**
     * Obtener mensajes asignados al niño autenticado
     */
    async getMyMessages(): Promise<ChildMessage[]> {
        try {
            const response = await apiClient.get<ApiResponse<ChildMessage[]>>('/child-messages/my-messages');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mis mensajes:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes favoritos del niño autenticado
     */
    async getFavoriteMessages(): Promise<ChildMessage[]> {
        try {
            const response = await apiClient.get<ApiResponse<ChildMessage[]>>('/child-messages/favorites');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mensajes favoritos:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes asignados por categoría
     */
    async getMessagesByCategory(categoryId: number): Promise<ChildMessage[]> {
        try {
            const response = await apiClient.get<ApiResponse<ChildMessage[]>>(`/child-messages/category/${categoryId}`);
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mensajes por categoría:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Asignar mensaje específico a un niño
     */
    async assignMessage(assignmentData: AssignMessageRequest): Promise<ChildMessage> {
        try {
            const response = await apiClient.post<ApiResponse<ChildMessage>>('/child-messages/assign', assignmentData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error asignando mensaje');
        } catch (error: any) {
            console.error('Error asignando mensaje:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes de un niño específico (para tutores)
     */
    async getChildMessages(childId: number): Promise<ChildMessage[]> {
        try {
            // Validar que el childId sea válido
            if (!childId || childId <= 0) {
                throw new Error('ID de niño inválido');
            }

            const response = await apiClient.get<ApiResponse<ChildMessage[]>>(`/child-messages/child/${childId}`);
            return response.data || [];
        } catch (error: any) {
            // Si es un error 400, probablemente significa que no hay mensajes asignados
            if (error.response?.status === 400) {
                console.log(`No hay mensajes asignados para el niño ${childId}`);
                return [];
            }

            console.error('Error obteniendo mensajes del niño:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Remover asignación específica de mensaje a niño
     */
    async removeMessageAssignment(childId: number, messageId: number): Promise<void> {
        try {
            const response = await apiClient.delete<ApiResponse>(`/child-messages/child/${childId}/message/${messageId}`);
            if (!response.success) {
                throw new Error(response.message || 'Error removiendo asignación');
            }
        } catch (error: any) {
            console.error('Error removiendo asignación:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Actualizar asignación de mensaje (marcar/desmarcar favorito)
     */
    async updateMessageAssignment(assignmentId: number, updateData: UpdateChildMessageRequest): Promise<ChildMessage> {
        try {
            const response = await apiClient.put<ApiResponse<ChildMessage>>(`/child-messages/${assignmentId}`, updateData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error actualizando asignación');
        } catch (error: any) {
            console.error('Error actualizando asignación:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Marcar mensaje como favorito
     */
    async markAsFavorite(assignmentId: number): Promise<ChildMessage> {
        return this.updateMessageAssignment(assignmentId, { is_favorite: true });
    }

    /**
     * Desmarcar mensaje como favorito
     */
    async unmarkAsFavorite(assignmentId: number): Promise<ChildMessage> {
        return this.updateMessageAssignment(assignmentId, { is_favorite: false });
    }

    /**
     * Alternar estado de favorito
     */
    async toggleFavorite(assignmentId: number, currentState: boolean): Promise<ChildMessage> {
        return this.updateMessageAssignment(assignmentId, { is_favorite: !currentState });
    }

    /**
     * Asignar múltiples mensajes a un niño
     */
    async assignMultipleMessages(childId: number, messageIds: number[]): Promise<ChildMessage[]> {
        try {
            const assignments = await Promise.all(
                messageIds.map(messageId =>
                    this.assignMessage({ child_id: childId, message_id: messageId })
                )
            );
            return assignments;
        } catch (error: any) {
            console.error('Error asignando múltiples mensajes:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener estadísticas de mensajes de un niño
     */
    async getChildMessageStats(childId: number): Promise<{
        totalMessages: number;
        favoriteMessages: number;
        messagesByCategory: { [categoryName: string]: number };
    }> {
        try {
            const messages = await this.getChildMessages(childId);

            const stats = {
                totalMessages: messages.length,
                favoriteMessages: messages.filter(m => m.is_favorite).length,
                messagesByCategory: {} as { [categoryName: string]: number }
            };

            // Agrupar por categoría
            messages.forEach(childMessage => {
                if (childMessage.message?.category_name) {
                    const categoryName = childMessage.message.category_name;
                    stats.messagesByCategory[categoryName] = (stats.messagesByCategory[categoryName] || 0) + 1;
                }
            });

            return stats;
        } catch (error: any) {
            console.error('Error obteniendo estadísticas:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Buscar mensajes asignados por texto
     */
    async searchAssignedMessages(searchTerm: string): Promise<ChildMessage[]> {
        try {
            const messages = await this.getMyMessages();

            return messages.filter(childMessage =>
                childMessage.message?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                childMessage.message?.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                childMessage.message?.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } catch (error: any) {
            console.error('Error buscando mensajes:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Manejar errores de la API
     */
    private handleError(error: any): Error {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        } else if (error.message) {
            return new Error(error.message);
        } else {
            return new Error('Ocurrió un error inesperado');
        }
    }
}

// Exportar instancia singleton
export const childMessageService = new ChildMessageService();
export default childMessageService;
