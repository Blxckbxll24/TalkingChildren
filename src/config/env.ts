// src/config/env.ts
// Configuración centralizada de variables de entorno

// Función helper para obtener variable de entorno
const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (!value && !defaultValue) {
        console.warn(`⚠️ Variable de entorno ${key} no está definida`);
        return '';
    }
    return value || defaultValue || '';
};

// Variables de red
export const SERVER_IP = getEnvVar('SERVER_IP', '192.168.0.189');
export const API_PORT = getEnvVar('API_PORT', '3000');
export const WEBSOCKET_PORT = getEnvVar('WEBSOCKET_PORT', '8080');

// URLs construidas automáticamente
export const API_BASE_URL = `http://${SERVER_IP}:${API_PORT}`;
export const WEBSOCKET_URL = `ws://${SERVER_IP}:${WEBSOCKET_PORT}/ws`;

// Configuración ESP32
export const ESP32_MAX_BUTTONS = parseInt(getEnvVar('ESP32_MAX_BUTTONS', '4'), 10);
export const ESP32_MAX_CATEGORIES = parseInt(getEnvVar('ESP32_MAX_CATEGORIES', '3'), 10);
export const ESP32_AUDIO_FILES = parseInt(getEnvVar('ESP32_AUDIO_FILES', '9'), 10);

// Configuración por defecto para desarrollo
console.log('🔧 Config:', {
    IP: SERVER_IP,
    API: API_PORT,
    WS: WEBSOCKET_PORT
});
