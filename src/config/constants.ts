// src/config/constants.ts
import { API_BASE_URL, WEBSOCKET_URL, ESP32_MAX_BUTTONS, ESP32_MAX_CATEGORIES, ESP32_AUDIO_FILES } from './env';

// Re-exportar configuraciones de red (obtenidas desde .env)
export const API_BASE_URL_CONST = API_BASE_URL;
export const WEBSOCKET_URL_CONST = WEBSOCKET_URL;

// Configuración ESP32 (obtenidas desde .env)
export const ESP32_MAX_BUTTONS_CONST = ESP32_MAX_BUTTONS;
export const ESP32_MAX_CATEGORIES_CONST = ESP32_MAX_CATEGORIES;
export const ESP32_AUDIO_FILES_CONST = ESP32_AUDIO_FILES;

// Audio file mapping for ESP32
export const ESP32_FILE_MAPPING = {
    1: { category: 1, files: ['001.wav', '002.wav', '003.wav'] }, // Básico/Saludos
    2: { category: 2, files: ['004.wav', '005.wav', '006.wav'] }, // Emociones
    3: { category: 3, files: ['007.wav', '008.wav', '009.wav'] }, // Necesidades
};

export { API_BASE_URL };
