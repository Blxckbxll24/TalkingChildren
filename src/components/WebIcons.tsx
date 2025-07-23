import React from 'react';
import { Platform } from 'react-native';
import { Text } from 'react-native';

// Iconos simples como componentes para web
interface IconProps {
  size?: number;
  color?: string;
}

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        🏠
      </Text>
    );
  }
  // Para móvil, puedes usar lucide-react-native aquí
  return <Text style={{ fontSize: size, color }}>🏠</Text>;
};

export const UserIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        👤
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>👤</Text>;
};

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        ⚙️
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>⚙️</Text>;
};

export const PlayIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        ▶️
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>▶️</Text>;
};

export const HeartIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        ❤️
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>❤️</Text>;
};

export const StarIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        ⭐
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>⭐</Text>;
};

export const VolumeIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        🔊
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>🔊</Text>;
};

export const BellIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        🔔
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>🔔</Text>;
};

export const PlusIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial', fontWeight: 'bold' }}>
        +
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>+</Text>;
};

export const MessageIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        💬
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>💬</Text>;
};

export const UsersIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        👥
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>👥</Text>;
};

export const ActivityIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: size, color, fontFamily: 'Arial' }}>
        📊
      </Text>
    );
  }
  return <Text style={{ fontSize: size, color }}>📊</Text>;
};
