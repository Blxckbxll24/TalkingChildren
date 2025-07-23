import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import { 
    Volume2, 
    VolumeX,
    Sun,
    Moon,
    User,
    Settings as SettingsIcon,
    ArrowLeft,
    Heart,
    Vibrate
} from 'lucide-react-native';

const SmartWatchSettingsScreen = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const { user, logout } = useAuthStore();
    const { screenWidth, screenHeight } = useDeviceType();
    
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [volume, setVolume] = useState(80);

    // Configuraciones para smartwatch
    const isSmallScreen = screenWidth <= 400 && screenHeight <= 400;
    const buttonSize = isSmallScreen ? 60 : 80;
    const fontSize = isSmallScreen ? 10 : 12;
    const padding = isSmallScreen ? 6 : 8;

    const handleLogout = async () => {
        await logout();
    };

    const SettingItem = ({ 
        icon, 
        title, 
        value, 
        onPress, 
        showSwitch = false, 
        switchValue = false, 
        onSwitchChange 
    }: {
        icon: React.ReactNode;
        title: string;
        value?: string;
        onPress?: () => void;
        showSwitch?: boolean;
        switchValue?: boolean;
        onSwitchChange?: (value: boolean) => void;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={showSwitch}
            className={`flex-row items-center justify-between p-${padding} mb-2 rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}
        >
            <View className="flex-row items-center flex-1">
                <View className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    {icon}
                </View>
                <View className="flex-1">
                    <Text 
                        className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontSize }}
                    >
                        {title}
                    </Text>
                    {value && (
                        <Text 
                            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                            {value}
                        </Text>
                    )}
                </View>
            </View>
            
            {showSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#767577', true: '#3b82f6' }}
                    thumbColor={switchValue ? '#fff' : '#f4f3f4'}
                />
            ) : (
                <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ›
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header compacto */}
            <View 
                className={`flex-row items-center justify-between p-${padding} ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
            >
                <TouchableOpacity>
                    <ArrowLeft size={isSmallScreen ? 16 : 20} color={isDark ? '#fff' : '#374151'} />
                </TouchableOpacity>
                <Text 
                    className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: fontSize + 2 }}
                >
                    Configuración
                </Text>
                <View style={{ width: isSmallScreen ? 16 : 20 }} />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding }}>
                {/* Información del usuario */}
                <View 
                    className={`rounded-xl p-${padding} mb-4 items-center ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                >
                    <View 
                        style={{ width: buttonSize, height: buttonSize }}
                        className="bg-blue-500 rounded-full justify-center items-center mb-2"
                    >
                        <User size={isSmallScreen ? 24 : 32} color="#fff" />
                    </View>
                    <Text 
                        className={`font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontSize: fontSize + 1 }}
                        numberOfLines={1}
                    >
                        {user?.name || 'Usuario'}
                    </Text>
                    <Text 
                        className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Niño
                    </Text>
                </View>

                {/* Configuraciones de Audio */}
                <Text 
                    className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: fontSize + 1 }}
                >
                    Audio
                </Text>
                
                <SettingItem
                    icon={soundEnabled ? 
                        <Volume2 size={isSmallScreen ? 14 : 16} color={isDark ? '#60a5fa' : '#3b82f6'} /> :
                        <VolumeX size={isSmallScreen ? 14 : 16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    }
                    title="Sonido"
                    value={soundEnabled ? 'Activado' : 'Desactivado'}
                    showSwitch={true}
                    switchValue={soundEnabled}
                    onSwitchChange={setSoundEnabled}
                />

                <SettingItem
                    icon={<Vibrate size={isSmallScreen ? 14 : 16} color={isDark ? '#60a5fa' : '#3b82f6'} />}
                    title="Vibración"
                    value={vibrationEnabled ? 'Activada' : 'Desactivada'}
                    showSwitch={true}
                    switchValue={vibrationEnabled}
                    onSwitchChange={setVibrationEnabled}
                />

                {/* Configuraciones de Pantalla */}
                <Text 
                    className={`font-bold mb-2 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: fontSize + 1 }}
                >
                    Pantalla
                </Text>
                
                <SettingItem
                    icon={isDark ? 
                        <Moon size={isSmallScreen ? 14 : 16} color="#60a5fa" /> :
                        <Sun size={isSmallScreen ? 14 : 16} color="#f59e0b" />
                    }
                    title="Tema"
                    value={isDark ? 'Oscuro' : 'Claro'}
                    showSwitch={true}
                    switchValue={isDark}
                    onSwitchChange={toggleTheme}
                />

                {/* Configuraciones de la App */}
                <Text 
                    className={`font-bold mb-2 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: fontSize + 1 }}
                >
                    Aplicación
                </Text>
                
                <SettingItem
                    icon={<Heart size={isSmallScreen ? 14 : 16} color="#ef4444" />}
                    title="Favoritos"
                    value="Gestionar"
                    onPress={() => {/* Navegación a favoritos */}}
                />

                <SettingItem
                    icon={<SettingsIcon size={isSmallScreen ? 14 : 16} color={isDark ? '#9ca3af' : '#6b7280'} />}
                    title="Avanzado"
                    value="Más opciones"
                    onPress={() => {/* Navegación a configuración avanzada */}}
                />

                {/* Botón de cierre de sesión */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-500 rounded-xl p-3 mt-6 items-center"
                >
                    <Text 
                        className="text-white font-bold"
                        style={{ fontSize }}
                    >
                        Cerrar Sesión
                    </Text>
                </TouchableOpacity>

                {/* Espacio inferior */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

export default SmartWatchSettingsScreen;
