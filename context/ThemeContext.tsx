import React from 'react';
import { useThemeStore } from '../stores/themeStore';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const useTheme = () => {
  const { theme, toggleTheme } = useThemeStore();
  return { theme, toggleTheme };
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};