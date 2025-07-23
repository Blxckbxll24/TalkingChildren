import apiClient from './apiClient';
import {
    RelationResponse,
    CreateRelationRequest,
    RelationStats,
    ApiResponse
} from '../types/api';

export class RelationService {
    /**
     * Crear nueva relación tutor-niño
     */
    async createRelation(relationData: CreateRelationRequest): Promise<RelationResponse> {
        try {
            const response = await apiClient.post<ApiResponse<RelationResponse>>('/relations', relationData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error creando relación');
        } catch (error: any) {
            console.error('Error creando relación:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener niños asignados al tutor autenticado
     */
    async getMyChildren(): Promise<RelationResponse[]> {
        try {
            const response = await apiClient.get<ApiResponse<RelationResponse[]>>('/relations/my-children');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mis niños:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener tutores asignados al niño autenticado
     */
    async getMyTutors(): Promise<RelationResponse[]> {
        try {
            const response = await apiClient.get<ApiResponse<RelationResponse[]>>('/relations/my-tutors');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo mis tutores:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener todas las relaciones (solo administradores)
     */
    async getAllRelations(): Promise<RelationResponse[]> {
        try {
            const response = await apiClient.get<ApiResponse<RelationResponse[]>>('/relations');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo relaciones:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Eliminar relación por IDs de tutor y niño
     */
    async deleteRelation(tutorId: number, childId: number): Promise<void> {
        try {
            const response = await apiClient.getInstance().delete<ApiResponse>('/relations', {
                data: { tutorId, childId }
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error eliminando relación');
            }
        } catch (error: any) {
            console.error('Error eliminando relación:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Eliminar relación por ID
     */
    async deleteRelationById(relationId: number): Promise<void> {
        try {
            const response = await apiClient.delete<ApiResponse>(`/relations/${relationId}`);
            if (!response.success) {
                throw new Error(response.message || 'Error eliminando relación');
            }
        } catch (error: any) {
            console.error('Error eliminando relación por ID:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener estadísticas de relaciones (solo administradores)
     */
    async getRelationStats(): Promise<RelationStats> {
        try {
            const response = await apiClient.get<ApiResponse<RelationStats>>('/relations/stats');
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error obteniendo estadísticas');
        } catch (error: any) {
            console.error('Error obteniendo estadísticas:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Vincular un niño al tutor autenticado
     */
    async linkChild(childId: number): Promise<RelationResponse> {
        try {
            const response = await apiClient.post<ApiResponse<RelationResponse>>('/relations/link', { childId });
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error vinculando niño');
        } catch (error: any) {
            console.error('Error vinculando niño:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Desvincular un niño del tutor autenticado
     */
    async unlinkChild(childId: number): Promise<void> {
        try {
            const response = await apiClient.post<ApiResponse>('/relations/unlink', { childId });
            if (!response.success) {
                throw new Error(response.message || 'Error desvinculando niño');
            }
        } catch (error: any) {
            console.error('Error desvinculando niño:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Verificar si existe una relación entre tutor y niño
     */
    async checkRelation(tutorId: number, childId: number): Promise<boolean> {
        try {
            const response = await apiClient.get<ApiResponse<{ exists: boolean }>>(`/relations/check/${tutorId}/${childId}`);
            return response.data?.exists || false;
        } catch (error: any) {
            console.error('Error verificando relación:', error);
            return false;
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
export const relationService = new RelationService();
export default relationService;
