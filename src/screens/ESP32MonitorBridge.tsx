import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ESP32MonitorScreen from './ESP32MonitorScreen';

export default function ESP32MonitorBridge() {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('🌉 ESP32MonitorBridge montado');
  }, []);

  // Mostrar directamente la pantalla del monitor
  return <ESP32MonitorScreen />;
}
