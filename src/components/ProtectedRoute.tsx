import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackComponent?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackComponent,
}) => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const userRole = user?.role_name?.toLowerCase();
  const hasAccess = userRole && allowedRoles.map((role) => role.toLowerCase()).includes(userRole);

  if (!user) {
    return (
      fallbackComponent || (
        <View
          className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Debes iniciar sesión para acceder a esta pantalla
          </Text>
        </View>
      )
    );
  }

  if (!hasAccess) {
    return (
      fallbackComponent || (
        <View
          className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No tienes permisos para acceder a esta pantalla
          </Text>
          <Text className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Rol requerido: {allowedRoles.join(', ')}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tu rol: {userRole || 'Sin rol'}
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
