import { useTheme } from '../context/ThemeContext';

export interface ThemeColors {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    border: string;
}

export const useThemeColors = (): ThemeColors => {
    const { theme } = useTheme();

    const lightColors: ThemeColors = {
        background: '#FFFFFF',
        card: '#F8FAFC',
        text: '#1F2937',
        textSecondary: '#6B7280',
        primary: '#3B82F6',
        secondary: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        border: '#E5E7EB',
    };

    const darkColors: ThemeColors = {
        background: '#111827',
        card: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB',
        primary: '#60A5FA',
        secondary: '#818CF8',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        border: '#374151',
    };

    return theme === 'dark' ? darkColors : lightColors;
};
