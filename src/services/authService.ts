import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import {
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    RegisterResponse,
    ProfileResponse,
    User
} from '../types/api';

export class AuthService {
    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly USER_KEY = 'user_data';

    /**
     * Iniciar sesión
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

            if (response.success && response.data) {
                // Guardar token y datos del usuario
                await AsyncStorage.setItem(AuthService.TOKEN_KEY, response.data.token);
                await AsyncStorage.setItem(AuthService.USER_KEY, JSON.stringify(response.data.user));
            }

            return response;
        } catch (error: any) {
            
            throw this.handleError(error);
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
            return response;
        } catch (error: any) {
            
            throw this.handleError(error);
        }
    }

    /**
     * Obtener perfil del usuario autenticado
     */
    async getProfile(): Promise<User> {
        try {
            const response = await apiClient.get<ProfileResponse>('/auth/profile');

            if (response.success && response.data) {
                // Actualizar datos del usuario en almacenamiento local
                await AsyncStorage.setItem(AuthService.USER_KEY, JSON.stringify(response.data));
                return response.data;
            }

            throw new Error('No se pudo obtener el perfil');
        } catch (error: any) {
            
            throw this.handleError(error);
        }
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        try {
            // Llamar al endpoint de logout (opcional)
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.warn('Error en logout del servidor:', error);
        } finally {
            // Limpiar almacenamiento local siempre
            await AsyncStorage.multiRemove([AuthService.TOKEN_KEY, AuthService.USER_KEY]);
        }
    }

    /**
     * Verificar si el usuario está autenticado
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem(AuthService.TOKEN_KEY);
            return !!token;
        } catch (error) {
            
            return false;
        }
    }

    /**
     * Obtener token almacenado
     */
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(AuthService.TOKEN_KEY);
        } catch (error) {
            
            return null;
        }
    }

    /**
     * Obtener datos del usuario almacenados
     */
    async getStoredUser(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem(AuthService.USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            
            return null;
        }
    }

    /**
     * Verificar si el token es válido
     */
    async validateToken(): Promise<boolean> {
        try {
            await this.getProfile();
            return true;
        } catch (error) {
            // Si falla obtener el perfil, el token no es válido
            await this.logout();
            return false;
        }
    }

    /**
     * Refrescar datos del usuario
     */
    async refreshUserData(): Promise<User> {
        return await this.getProfile();
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
export const authService = new AuthService();
export default authService;
