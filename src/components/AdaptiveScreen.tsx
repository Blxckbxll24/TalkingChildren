import React from 'react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useAuthStore } from '../stores/authStore';

// Importar las versiones específicas de cada pantalla
import LoginScreen from '../screens/LoginScreen';
import LoginScreenPC from '../screens/pc/LoginScreenPC';

import DashboardScreen from '../screens/Dashboard';
import DashboardScreenPC from '../screens/pc/DashboardScreenPC';

import SmartWatchHomeScreen from '../screens/smartwatch/SmartWatchHomeScreen';

interface AdaptiveScreenProps {
    screenType: 'login' | 'dashboard' | 'home';
}

const AdaptiveScreen: React.FC<AdaptiveScreenProps> = ({ screenType }) => {
    const { deviceType, isSmartwatch, isDesktop } = useDeviceType();
    const { user } = useAuthStore();
    
    // Determinar qué componente mostrar según el tipo de dispositivo y usuario
    const getScreenComponent = () => {
        switch (screenType) {
            case 'login':
                if (isDesktop) {
                    return <LoginScreenPC />;
                }
                return <LoginScreen />;
                
            case 'dashboard':
                if (isSmartwatch) {
                    return <SmartWatchHomeScreen />;
                } else if (isDesktop && (user?.role_name === 'admin' || user?.role_name === 'tutor')) {
                    return <DashboardScreenPC />;
                }
                return <DashboardScreen />;
                
            case 'home':
                if (isSmartwatch) {
                    return <SmartWatchHomeScreen />;
                } else if (isDesktop && (user?.role_name === 'admin' || user?.role_name === 'tutor')) {
                    return <DashboardScreenPC />;
                }
                return <DashboardScreen />;
                
            default:
                return <DashboardScreen />;
        }
    };

    return getScreenComponent();
};

export default AdaptiveScreen;
