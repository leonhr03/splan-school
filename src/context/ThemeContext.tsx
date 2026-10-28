import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../assets/colors.ts';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeType>('system');

  // Fallback auf 'light', falls getColorScheme() null liefert
  const [systemScheme, setSystemScheme] = useState<
    NonNullable<ColorSchemeName>
  >(Appearance.getColorScheme() ?? 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setSystemScheme(colorScheme);
      }
    });
    return () => subscription.remove();
  }, []);

  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook für einfache Nutzung in Komponenten
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useTheme muss innerhalb eines ThemeProviders verwendet werden',
    );
  }
  return context;
};
