import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { useAuthStore } from './src/stores/authStore';
import AdaptiveAppNavigator from './src/navigation/AdaptiveAppNavigator';
import Toast from 'react-native-toast-message';

import './global.css'; 

export default function App() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    // Cargar autenticación almacenada al iniciar la app
    loadStoredAuth();
  }, [loadStoredAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <AdaptiveAppNavigator />
        </NavigationContainer>
        <Toast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
