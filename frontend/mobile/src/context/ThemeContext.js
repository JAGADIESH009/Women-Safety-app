import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const THEME_STORAGE_KEY = '@safeher_theme_preference';

export function ThemeProvider({ children }) {
  const systemColorScheme = 'light';
  
  // 'system', 'light', or 'dark'
  const [themePreference, setThemePreference] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
          setThemePreference(storedTheme);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  const changeThemePreference = async (newPref) => {
    try {
      setThemePreference(newPref);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newPref);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const isDark = themePreference === 'system' 
    ? (systemColorScheme === 'dark' || systemColorScheme === null)
    : themePreference === 'dark';

  if (!isReady) {
    return null; // Prevent flash of wrong theme during initial hydration
  }

  return (
    <ThemeContext.Provider value={{ themePreference, changeThemePreference, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
