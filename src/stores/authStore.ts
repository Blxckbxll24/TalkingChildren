import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { User, LoginRequest, RegisterRequest } from '../types/api';
import Toast from 'react-native-toast-message';

interface AuthState {
    // Estado
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Acciones
    login: (credentials: LoginRequest) => Promise<boolean>;
    register: (userData: RegisterRequest) => Promise<boolean>;
    logout: () => Promise<void>;
    loadStoredAuth: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Iniciar sesión
            login: async (credentials: LoginRequest): Promise<boolean> => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.login(credentials);

                    if (response.success && response.data) {
                        set({
                            user: response.data.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });

                        Toast.show({
                            type: 'success',
                            text1: 'Bienvenido',
                            text2: `Hola ${response.data.user.name}!`,
                        });

                        return true;
                    } else {
                        throw new Error(response.message || 'Error en el login');
                    }
                } catch (error: any) {
                    const errorMessage = error.message || 'Error al iniciar sesión';
                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                        user: null
                    });

                    Toast.show({
                        type: 'error',
                        text1: 'Error de Login',
                        text2: errorMessage,
                    });

                    return false;
                }
            },

            // Registrar usuario
            register: async (userData: RegisterRequest): Promise<boolean> => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.register(userData);

                    if (response.success) {
                        set({ isLoading: false });

                        Toast.show({
                            type: 'success',
                            text1: 'Registro Exitoso',
                            text2: 'Usuario creado correctamente. Ahora puedes iniciar sesión.',
                        });

                        return true;
                    } else {
                        throw new Error(response.message || 'Error en el registro');
                    }
                } catch (error: any) {
                    const errorMessage = error.message || 'Error al registrar usuario';
                    set({
                        error: errorMessage,
                        isLoading: false
                    });

                    Toast.show({
                        type: 'error',
                        text1: 'Error de Registro',
                        text2: errorMessage,
                    });

                    return false;
                }
            },

            // Cerrar sesión
            logout: async (): Promise<void> => {
                try {
                    set({ isLoading: true });

                    await authService.logout();

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });

                    Toast.show({
                        type: 'info',
                        text1: 'Sesión Cerrada',
                        text2: 'Has cerrado sesión correctamente',
                    });
                } catch (error: any) {
                    console.error('Error en logout:', error);
                    // Incluso si hay error, limpiar el estado local
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            // Cargar autenticación almacenada
            loadStoredAuth: async (): Promise<void> => {
                try {
                    set({ isLoading: true });

                    const isAuthenticated = await authService.isAuthenticated();

                    if (isAuthenticated) {
                        // Validar que el token siga siendo válido
                        const isValid = await authService.validateToken();

                        if (isValid) {
                            const user = await authService.getStoredUser();
                            if (user) {
                                set({
                                    user,
                                    isAuthenticated: true,
                                    isLoading: false,
                                });
                                return;
                            }
                        }
                    }

                    // Si no está autenticado o el token no es válido
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Error cargando autenticación:', error);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            // Refrescar perfil del usuario
            refreshProfile: async (): Promise<void> => {
                try {
                    const user = await authService.refreshUserData();
                    set({ user });
                } catch (error: any) {
                    console.error('Error refrescando perfil:', error);
                    // Si falla refrescar perfil, posiblemente el token expiró
                    await get().logout();
                }
            },

            // Limpiar error
            clearError: () => {
                set({ error: null });
            },

            // Establecer estado de carga
            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => AsyncStorage),
            // Solo persistir datos importantes
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Hook para usar datos del usuario
export const useUser = () => {
    const user = useAuthStore((state) => state.user);
    return user;
};

// Hook para verificar rol
export const useHasRole = (roleId: number) => {
    const user = useAuthStore((state) => state.user);
    return user?.role_id === roleId;
};

// Constantes de roles
export const ROLES = {
    ADMIN: 1,
    TUTOR: 2,
    CHILD: 3,
} as const;
