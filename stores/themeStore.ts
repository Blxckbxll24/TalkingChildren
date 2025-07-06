import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme as nativewindColorScheme } from 'nativewind';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', 
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
          nativewindColorScheme.set(nextTheme); 
          return { theme: nextTheme };
        }),
      setTheme: (theme: Theme) => {
        nativewindColorScheme.set(theme); 
        set({ theme });
      },
    }),
    {
      name: 'theme-storage', 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);