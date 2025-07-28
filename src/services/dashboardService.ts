import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface DashboardStats {
    // Administrador
    totalUsers?: number;
    totalMessagesAdmin?: number;
    totalRelations?: number;

    // Tutor
    myChildren?: number;
    myMessages?: number;
    assignedMessages?: number;

    // Niño y Admin (shared)
    totalMessages?: number;
    favoriteMessages?: number;
    totalCategories?: number;
}

export interface DashboardActivity {
    id: string;
    text: string;
    type: string;
    timestamp: string;
}

export class DashboardService {
    /**
     * Obtener estadísticas según el rol del usuario
     */
    async getStats(): Promise<DashboardStats> {
        try {
            console.log('🔍 Requesting dashboard stats...');
            console.log('🌐 API URL:', '/dashboard/stats');
            const response = await apiClient.get('/dashboard/stats');
            console.log('📊 Dashboard stats response:', response);

            // Verificar estructura de respuesta correcta
            if (response && response.success && response.data) {
                console.log('✅ Dashboard stats data received:', response.data);
                return response.data;
            }

            console.warn('⚠️ Invalid response structure:', response);
            throw new Error('No data received');
        } catch (error: any) {
            console.error('❌ Error getting dashboard stats:', error);

            // Si es un error de axios, mostrar más detalles
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', error.response.data);
            }

            throw new Error('Error al obtener estadísticas del dashboard');
        }
    }

    /**
     * Obtener actividad reciente según el rol del usuario
     */
    async getActivity(): Promise<DashboardActivity[]> {
        try {
            console.log('🔍 Requesting dashboard activity...');
            const response = await apiClient.get('/dashboard/activity');
            console.log('📈 Dashboard activity response:', response);

            // Verificar estructura de respuesta correcta
            if (response && response.success && Array.isArray(response.data)) {
                console.log('✅ Dashboard activity data received:', response.data);
                return response.data;
            }

            console.warn('⚠️ No activity data found, returning empty array');
            return [];
        } catch (error: any) {
            console.error('❌ Error getting dashboard activity:', error);

            // Si es un error de axios, mostrar más detalles
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', error.response.data);
            }

            throw new Error('Error al obtener actividad del dashboard');
        }
    }

    /**
     * Obtener mensajes del dashboard según el rol
     */
    async getMessages(): Promise<any[]> {
        try {
            const response = await apiClient.get('/dashboard/messages');
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error getting dashboard messages:', error);
            throw new Error('Error al obtener mensajes del dashboard');
        }
    }
}

export const dashboardService = new DashboardService();
