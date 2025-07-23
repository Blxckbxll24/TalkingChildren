import apiClient from './apiClient';
import { Role, ApiResponse } from '../types/api';

export class RoleService {
    /**
     * Obtener todos los roles del sistema
     */
    async getAllRoles(): Promise<Role[]> {
        try {
            const response = await apiClient.get<ApiResponse<Role[]>>('/roles');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo roles:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Crear nuevo rol (solo administradores)
     */
    async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
        try {
            const response = await apiClient.post<ApiResponse<Role>>('/roles', roleData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error creando rol');
        } catch (error: any) {
            console.error('Error creando rol:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Actualizar rol existente (solo administradores)
     */
    async updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
        try {
            const response = await apiClient.put<ApiResponse<Role>>(`/roles/${id}`, roleData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error actualizando rol');
        } catch (error: any) {
            console.error('Error actualizando rol:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Eliminar rol (solo administradores)
     */
    async deleteRole(id: number): Promise<void> {
        try {
            const response = await apiClient.delete<ApiResponse>(`/roles/${id}`);
            if (!response.success) {
                throw new Error(response.message || 'Error eliminando rol');
            }
        } catch (error: any) {
            console.error('Error eliminando rol:', error);
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
export const roleService = new RoleService();
export default roleService;
