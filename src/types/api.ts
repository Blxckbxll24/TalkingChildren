// Tipos para la API
export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
    created_at?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role_id: number;
}

export interface LoginResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
    };
    message: string;
}

export interface RegisterResponse {
    success: boolean;
    data: User;
    message: string;
}

export interface ProfileResponse {
    success: boolean;
    data: User;
    message: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Message {
    id: number;
    text: string;  // El backend usa 'text' no 'title' ni 'content'
    audio_url?: string;  // El backend usa 'audio_url' no 'audio_path'
    category_id: number;
    category_name?: string;
    created_by: number;
    creator_name?: string;  // El backend devuelve 'creator_name' no 'created_by_name'
    is_active?: boolean;
    is_favorite?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ChildMessage {
    id: number;
    child_id: number;
    message_id: number;
    is_favorite: boolean;
    assigned_at: string;
    assigned_by?: number;
    message?: Message;
}

export interface AssignMessageRequest {
    child_id: number;
    message_id: number;
}

export interface UpdateChildMessageRequest {
    is_favorite?: boolean;
}

export interface CreateMessageDTO {
    text: string;
    category_id: number;
}

export interface UpdateMessageDTO {
    text?: string;
    category_id?: number;
    is_active?: boolean;
}

export interface Relation {
    id: number;
    tutor_id: number;
    child_id: number;
    tutor_name?: string;
    child_name?: string;
    created_at?: string;
}

export interface RelationResponse {
    id: number;
    tutor: {
        id: number;
        name: string;
        email: string;
    };
    child: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
}

export interface CreateRelationRequest {
    tutor_id: number;
    child_id: number;
}

export interface RelationStats {
    totalRelations: number;
    totalTutors: number;
    totalChildren: number;
    avgChildrenPerTutor: number;
}// Tipos para WebSocket y ESP32
export interface WebSocketStatus {
    connected: boolean;
    clients: number;
    esp32_connected: boolean;
}

export interface ESP32Status {
    connected: boolean;
    battery_level?: number;
    current_category?: number;
    last_message?: number;
    status: 'playing' | 'idle' | 'charging' | 'low_battery';
}

export interface TTSVoice {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female';
    sample_rate: number;
}

export interface TTSSettings {
    voice_id: string;
    speed: number;
    pitch: number;
    volume: number;
}

// Tipos para errores
export interface ApiError {
    message: string;
    status?: number;
    field?: string;
}
