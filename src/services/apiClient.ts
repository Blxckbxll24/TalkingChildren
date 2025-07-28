import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';

const API_BASE_URL = `http://${API_URL}/api`;

class ApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.instance.interceptors.request.use(
            async (config) => {
                try {
                    // Intentar con ambos nombres de clave para compatibilidad
                    let token = await AsyncStorage.getItem('authToken');
                    if (!token) {
                        token = await AsyncStorage.getItem('auth_token');
                    }
                    console.log('🔑 Token retrieved from storage:', token ? token.substring(0, 50) + '...' : 'null');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.warn('Error obteniendo token:', error);
                }
                console.log('📤 Request URL:', `${config.baseURL || ''}${config.url || ''}`);
                console.log('📤 Request headers:', config.headers);
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor para responses - manejar errores globalmente
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log('📥 Response received:', response.status, response.statusText);
                console.log('📥 Response data:', response.data);

                // Manejar respuesta 304 (Not Modified) - forzar refetch
                if (response.status === 304) {
                    console.log('⚠️ 304 Not Modified - Data might be cached, attempting fresh request');
                    // Para 304, axios generalmente retorna la data cached, pero por si acaso verificamos
                    if (!response.data) {
                        console.log('⚠️ No data in 304 response, this might cause display issues');
                    }
                }

                return response;
            },
            async (error: AxiosError) => {
                console.log('❌ Response error:', error.response?.status, error.response?.statusText);
                console.log('❌ Response error data:', error.response?.data);
                const { response } = error;

                if (response?.status === 401) {
                    // Token expirado o no válido
                    await this.handleUnauthorized();
                } else if (response?.status === 403) {
                    Toast.show({
                        type: 'error',
                        text1: 'Acceso Denegado',
                        text2: 'No tienes permisos para realizar esta acción',
                    });
                } else if (response && response.status >= 500) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error del Servidor',
                        text2: 'Algo salió mal en el servidor. Intenta más tarde.',
                    });
                } else if (!response) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error de Conexión',
                        text2: 'No se pudo conectar al servidor',
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    private async handleUnauthorized() {
        try {
            await AsyncStorage.multiRemove(['auth_token', 'user_data']);
            Toast.show({
                type: 'error',
                text1: 'Sesión Expirada',
                text2: 'Por favor, inicia sesión nuevamente',
            });
            // Aquí puedes agregar navegación a login si es necesario
        } catch (error) {

        }
    }

    // Métodos HTTP
    async get<T = any>(url: string, params?: any): Promise<T> {
        const response = await this.instance.get(url, { params });
        return response.data;
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.instance.post(url, data);
        return response.data;
    }

    async put<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.instance.put(url, data);
        return response.data;
    }

    async delete<T = any>(url: string): Promise<T> {
        const response = await this.instance.delete(url);
        return response.data;
    }

    // Método para subir archivos
    async upload<T = any>(url: string, formData: FormData): Promise<T> {
        const response = await this.instance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Método para descargar archivos
    async download(url: string): Promise<Blob> {
        const response = await this.instance.get(url, {
            responseType: 'blob',
        });
        return response.data;
    }

    // Configurar la URL base dinámicamente
    setBaseURL(baseURL: string) {
        this.instance.defaults.baseURL = baseURL;
    }

    // Obtener instancia para casos especiales
    getInstance(): AxiosInstance {
        return this.instance;
    }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
export default apiClient;
