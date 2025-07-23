import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type DeviceType = 'smartwatch' | 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
    deviceType: DeviceType;
    screenWidth: number;
    screenHeight: number;
    isLandscape: boolean;
    isSmartwatch: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

export const useDeviceType = (): DeviceInfo => {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
        const { width, height } = Dimensions.get('window');
        return getDeviceInfo(width, height);
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDeviceInfo(getDeviceInfo(window.width, window.height));
        });

        return () => subscription?.remove();
    }, []);

    return deviceInfo;
};

const getDeviceInfo = (width: number, height: number): DeviceInfo => {
    const isLandscape = width > height;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);

    let deviceType: DeviceType;

    // Detectar smartwatch (pantallas muy pequeñas y generalmente cuadradas)
    if (maxDimension <= 400 && minDimension <= 400) {
        deviceType = 'smartwatch';
    }
    // Detectar desktop/web (pantallas grandes)
    else if (Platform.OS === 'web' || minDimension >= 768) {
        deviceType = 'desktop';
    }
    // Detectar tablet (pantallas medianas)
    else if (minDimension >= 600 || maxDimension >= 900) {
        deviceType = 'tablet';
    }
    // Por defecto mobile
    else {
        deviceType = 'mobile';
    }

    return {
        deviceType,
        screenWidth: width,
        screenHeight: height,
        isLandscape,
        isSmartwatch: deviceType === 'smartwatch',
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
    };
};
