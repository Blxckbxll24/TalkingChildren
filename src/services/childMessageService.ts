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
            console.log('🔍 Calling /child-messages/my-messages endpoint...');

            // Agregar headers para evitar cache y forzar una respuesta completa
            const response = await apiClient.get('/child-messages/my-messages', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'If-None-Match': '',  // Evitar cache ETags
                    'If-Modified-Since': ''  // Evitar cache de última modificación
                }
            });

            console.log('📤 Full API response:', JSON.stringify(response, null, 2));
            console.log('📤 Response status:', response.status);
            console.log('📤 Response headers:', response.headers);
            console.log('📤 Raw API response data:', JSON.stringify(response.data, null, 2));

            // Verificar que tenemos datos válidos
            if (!response.data) {
                console.warn('⚠️ No response.data found');
                return [];
            }

            // Verificar si success existe y es true, o si no existe pero tenemos data válida
            const hasValidSuccess = response.data.success === true || response.data.success === undefined;
            if (response.data.success === false) {
                console.warn('⚠️ Response success is explicitly false:', response.data.success);
                return [];
            }

            console.log('✅ Success validation passed. success:', response.data.success, 'hasValidSuccess:', hasValidSuccess);

            // Los datos pueden estar en response.data.data O directamente en response.data
            let messagesArray = response.data.data;
            if (!messagesArray && Array.isArray(response.data)) {
                messagesArray = response.data;
                console.log('📋 Using response.data directly as it is an array');
            }

            if (!messagesArray) {
                console.warn('⚠️ No messages array found in response.data.data or response.data');
                console.log('📊 Available keys in response.data:', Object.keys(response.data));
                return [];
            }

            if (!Array.isArray(messagesArray)) {
                console.warn('⚠️ Messages data is not an array:', typeof messagesArray, messagesArray);
                return [];
            }

            console.log('✅ API Response data is valid array with', messagesArray.length, 'items');

            // Transformar cada mensaje según la estructura real del backend
            const transformedMessages: ChildMessage[] = messagesArray.map((item: any, index: number) => {
                console.log(`🔄 Transforming message ${index + 1}:`, JSON.stringify(item, null, 2));

                const transformedMessage = {
                    id: item.id,
                    child_id: 0, // No viene en la respuesta, pero no es necesario para la vista
                    message_id: item.message?.id || 0,
                    is_favorite: Boolean(item.is_favorite),
                    assigned_at: item.assigned_at,
                    assigned_by: item.assigned_by?.id,
                    message: {
                        id: item.message?.id || 0,
                        text: item.message?.text || '',
                        audio_url: item.message?.audio_url || '',
                        category_id: item.message?.category?.id || 0,
                        category_name: item.message?.category?.name || '',
                        created_by: 0,
                        is_active: true
                    }
                } as ChildMessage;

                console.log(`✅ Transformed message ${index + 1}:`, JSON.stringify(transformedMessage, null, 2));
                return transformedMessage;
            });

            console.log('🎯 Final transformed messages count:', transformedMessages.length);
            console.log('🎯 Final transformed messages:', JSON.stringify(transformedMessages, null, 2));

            if (transformedMessages.length === 0) {
                console.error('❌ PROBLEM: Transformed messages array is empty but original data had items');
                console.error('❌ Original data:', JSON.stringify(messagesArray, null, 2));
            }

            return transformedMessages;

        } catch (error: any) {
            console.error('❌ Error in getMyMessages:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);

            if (error.response?.status === 403) {
                throw new Error('No tienes permisos para ver estos mensajes');
            }
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes favoritos del niño autenticado
     */
    async getFavoriteMessages(): Promise<ChildMessage[]> {
        try {
            const response = await apiClient.get('/child-messages/favorites');
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error: any) {
            console.error('Error in getFavoriteMessages:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener mensajes asignados por categoría
     */
    async getMessagesByCategory(categoryId: number): Promise<ChildMessage[]> {
        try {
            const response = await apiClient.get(`/child-messages/category/${categoryId}`);
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error: any) {
            console.error('Error in getMessagesByCategory:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Asignar mensaje específico a un niño
     */
    async assignMessage(assignmentData: AssignMessageRequest): Promise<ChildMessage> {
        try {
            console.log('🔍 Assigning message:', assignmentData);

            // Validar datos de entrada
            if (!assignmentData.child_id || !assignmentData.message_id) {
                throw new Error('child_id y message_id son requeridos');
            }

            const response = await apiClient.post('/child-messages/assign', assignmentData);

            console.log('📤 Assignment response:', response);

            if (response && response.success && response.data) {
                return response.data;
            }

            // Si llegamos aquí, algo salió mal
            const errorMessage = response?.message || 'Error desconocido al asignar mensaje';
            console.error('❌ Assignment failed:', errorMessage);
            throw new Error(errorMessage);

        } catch (error: any) {
            console.error('❌ Error in assignMessage:', error);

            // Manejar errores específicos del backend
            if (error.response?.status === 409) {
                throw new Error('El mensaje ya está asignado a este niño');
            }

            if (error.response?.status === 404) {
                throw new Error('El mensaje o el niño no existe');
            }

            if (error.response?.status === 403) {
                throw new Error('No tienes permisos para asignar mensajes a este niño');
            }

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

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

            const response = await apiClient.get(`/child-messages/child/${childId}`);
            console.log('📥 Child messages response:', response);

            if (response && response.success && response.data) {
                return response.data;
            }

            console.warn('⚠️ Child messages response structure unexpected:', response);
            return [];
        } catch (error: any) {
            // Si es un error 400, probablemente significa que no hay mensajes asignados
            if (error.response?.status === 400 || error.response?.status === 404) {
                console.log(`No hay mensajes asignados para el niño ${childId}`);
                return [];
            }

            console.error('Error in getChildMessages:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Remover asignación específica de mensaje a niño
     */
    async removeMessageAssignment(childId: number, messageId: number): Promise<void> {
        try {
            const response = await apiClient.delete(`/child-messages/child/${childId}/message/${messageId}`);
            if (response.data && !response.data.success) {
                throw new Error(response.data.message || 'Error removiendo asignación');
            }
        } catch (error: any) {
            console.error('Error in removeMessageAssignment:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Actualizar asignación de mensaje (marcar/desmarcar favorito)
     */
    async updateMessageAssignment(assignmentId: number, updateData: UpdateChildMessageRequest): Promise<ChildMessage> {
        try {
            const response = await apiClient.put(`/child-messages/${assignmentId}`, updateData);
            if (response.data && response.data.success && response.data.data) {
                const item = response.data.data;

                // Transformar la respuesta del backend al formato que espera el frontend
                return {
                    id: item.id,
                    child_id: item.child_id || 0,
                    message_id: item.message?.id || 0,
                    is_favorite: item.is_favorite,
                    assigned_at: item.assigned_at,
                    assigned_by: item.assigned_by?.id,
                    message: {
                        id: item.message?.id || 0,
                        text: item.message?.text || '',
                        audio_url: item.message?.audio_url,
                        category_id: item.message?.category?.id || 0,
                        category_name: item.message?.category?.name || '',
                        created_by: 0,
                        is_active: true
                    }
                } as ChildMessage;
            }
            throw new Error(response.data?.message || 'Error actualizando asignación');
        } catch (error: any) {
            console.error('Error in updateMessageAssignment:', error);
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
            console.error('Error in assignMultipleMessages:', error);
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
            console.error('Error in getChildMessageStats:', error);
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
            console.error('Error in searchAssignedMessages:', error);
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
