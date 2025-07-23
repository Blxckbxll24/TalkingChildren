import apiClient from './apiClient';
import { Category, ApiResponse } from '../types/api';

export class CategoryService {
    /**
     * Obtener todas las categorías disponibles
     */
    async getAllCategories(): Promise<Category[]> {
        try {
            const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo categorías:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener información básica de categorías
     */
    async getBasicCategories(): Promise<Category[]> {
        try {
            const response = await apiClient.get<ApiResponse<Category[]>>('/categories/basic');
            return response.data || [];
        } catch (error: any) {
            console.error('Error obteniendo categorías básicas:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Obtener categoría específica por ID
     */
    async getCategoryById(id: number): Promise<Category> {
        try {
            const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Categoría no encontrada');
        } catch (error: any) {
            console.error('Error obteniendo categoría:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Crear nueva categoría
     */
    async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
        try {
            const response = await apiClient.post<ApiResponse<Category>>('/categories', categoryData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error creando categoría');
        } catch (error: any) {
            console.error('Error creando categoría:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Actualizar categoría existente
     */
    async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
        try {
            const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Error actualizando categoría');
        } catch (error: any) {
            console.error('Error actualizando categoría:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Eliminar categoría
     */
    async deleteCategory(id: number): Promise<void> {
        try {
            const response = await apiClient.delete<ApiResponse>(`/categories/${id}`);
            if (!response.success) {
                throw new Error(response.message || 'Error eliminando categoría');
            }
        } catch (error: any) {
            console.error('Error eliminando categoría:', error);
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
export const categoryService = new CategoryService();
export default categoryService;
