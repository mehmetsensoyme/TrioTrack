import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'paisa' | 'zero' | 'buckwheat';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'medium' | 'large';
export type FontFamilyChoice = 'modern' | 'classic' | 'code';

const STORAGE_THEME_NAME = '@triotrack_theme_name';
const STORAGE_THEME_MODE = '@triotrack_theme_mode';
const STORAGE_TEXT_SIZE = '@triotrack_text_size';
const STORAGE_FONT_CHOICE = '@triotrack_font_choice';
const STORAGE_CURRENCY = '@triotrack_currency';

export interface ThemeColors {
  primary: string;
  onPrimary: string; // Primary üzerindeki yazı rengi (Kontrast için kritik)
  background: string;
  card: string;
  text: string;
  accent: string;
}

export interface ThemeStyles {
  roundness: number;
  fontFamily: string;
  titleWeight: 'normal' | 'bold' | '900' | '600' | '700' | '800';
  elevation: number;
  fontSizeMultiplier: number;
}

interface ThemeContextProps {
  themeName: ThemeName;
  themeMode: ThemeMode;
  textSize: TextSize;
  fontChoice: FontFamilyChoice;
  colors: ThemeColors;
  styles: ThemeStyles;
  setTheme: (name: ThemeName) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setFontChoice: (font: FontFamilyChoice) => void;
  setCurrency: (currency: string) => void;
  isDark: boolean;
  currency: string;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeName: 'paisa',
  themeMode: 'system',
  textSize: 'medium',
  fontChoice: 'modern',
  colors: { primary: '', onPrimary: '#FFFFFF', background: '', card: '', text: '', accent: '' },
  styles: { roundness: 24, fontFamily: 'System', titleWeight: 'bold', elevation: 5, fontSizeMultiplier: 1 },
  setTheme: () => {},
  setThemeMode: () => {},
  setTextSize: () => {},
  setFontChoice: () => {},
  setCurrency: () => {},
  isDark: false,
  currency: '₺',
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('paisa');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [fontChoice, setFontChoice] = useState<FontFamilyChoice>('modern');
  const [currency, setCurrency] = useState<string>('₺');
  
  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme());

  // AsyncStorage'dan kayıtlı tema ve tipografi tercihlerini açılışta yükle (Kalıcı Bellek)
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedMode, savedSize, savedFont, savedCurr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_THEME_NAME),
          AsyncStorage.getItem(STORAGE_THEME_MODE),
          AsyncStorage.getItem(STORAGE_TEXT_SIZE),
          AsyncStorage.getItem(STORAGE_FONT_CHOICE),
          AsyncStorage.getItem(STORAGE_CURRENCY),
        ]);
        if (savedTheme && (savedTheme === 'paisa' || savedTheme === 'zero' || savedTheme === 'buckwheat')) {
          setThemeName(savedTheme as ThemeName);
        }
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setThemeMode(savedMode as ThemeMode);
        }
        if (savedSize && (savedSize === 'small' || savedSize === 'medium' || savedSize === 'large')) {
          setTextSize(savedSize as TextSize);
        }
        if (savedFont && (savedFont === 'modern' || savedFont === 'classic' || savedFont === 'code')) {
          setFontChoice(savedFont as FontFamilyChoice);
        }
        if (savedCurr) {
          setCurrency(savedCurr);
        }
      } catch (e) {
        console.warn('ThemeContext: Tercihler AsyncStorage\'dan okunurken hata:', e);
      }
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const handleSetTheme = (name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(STORAGE_THEME_NAME, name).catch(() => {});
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    AsyncStorage.setItem(STORAGE_THEME_MODE, mode).catch(() => {});
  };

  const handleSetTextSize = (size: TextSize) => {
    setTextSize(size);
    AsyncStorage.setItem(STORAGE_TEXT_SIZE, size).catch(() => {});
  };

  const handleSetFontChoice = (font: FontFamilyChoice) => {
    setFontChoice(font);
    AsyncStorage.setItem(STORAGE_FONT_CHOICE, font).catch(() => {});
  };

  const handleSetCurrency = (curr: string) => {
    setCurrency(curr);
    AsyncStorage.setItem(STORAGE_CURRENCY, curr).catch(() => {});
  };

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  // Standart Koyu Gri (OLED olmayan yumuşak koyu tema) ve Aydınlık tema
  const background = isDark ? '#18181B' : '#F8F9FA';
  const card = isDark ? '#27272A' : '#FFFFFF';
  const text = isDark ? '#F4F4F5' : '#18181B';

  // Kontrastlı ve sapıtmayan renk paleti tanımları
  const themeDefinitions: Record<ThemeName, { primary: string, onPrimary: string, accent: string }> = {
    paisa: { 
      // Material You: Hem koyu hem açık modda beyaz yazının rahat okunabildiği güçlü mor
      primary: isDark ? '#8B5CF6' : '#6D28D9', 
      onPrimary: '#FFFFFF',
      accent: isDark ? '#4C1D95' : '#EDE9FE' 
    },
    zero: { 
      // Minimalist: Koyu modda net beyaz, açık modda net siyah
      primary: isDark ? '#FAFAFA' : '#18181B', 
      onPrimary: isDark ? '#18181B' : '#FFFFFF',
      accent: isDark ? '#3F3F46' : '#E4E4E7' 
    },
    buckwheat: { 
      // Enerjik Turuncu
      primary: '#EA580C', 
      onPrimary: '#FFFFFF',
      accent: isDark ? '#7C2D12' : '#FFEDD5' 
    }
  };

  const multiplier = textSize === 'small' ? 0.85 : textSize === 'large' ? 1.2 : 1;

  let selectedFontFamily = Platform.OS === 'ios' ? 'System' : 'sans-serif';
  if (fontChoice === 'classic') selectedFontFamily = Platform.OS === 'ios' ? 'Georgia' : 'serif';
  if (fontChoice === 'code') selectedFontFamily = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  const styleDefinitions: Record<ThemeName, ThemeStyles> = {
    paisa: { 
      roundness: 20 * multiplier, 
      fontFamily: selectedFontFamily, 
      titleWeight: '800',
      elevation: 4,
      fontSizeMultiplier: multiplier
    },
    zero: { 
      roundness: 6 * multiplier, 
      fontFamily: selectedFontFamily,
      titleWeight: '600',
      elevation: 0,
      fontSizeMultiplier: multiplier
    },
    buckwheat: { 
      roundness: 14 * multiplier, 
      fontFamily: selectedFontFamily, 
      titleWeight: 'bold',
      elevation: 2,
      fontSizeMultiplier: multiplier
    }
  };

  const colors: ThemeColors = {
    background,
    card,
    text,
    primary: themeDefinitions[themeName].primary,
    onPrimary: themeDefinitions[themeName].onPrimary,
    accent: themeDefinitions[themeName].accent,
  };

  const styles = styleDefinitions[themeName];

  return (
    <ThemeContext.Provider value={{ 
      themeName, themeMode, textSize, fontChoice, 
      colors, styles, 
      setTheme: handleSetTheme, 
      setThemeMode: handleSetThemeMode, 
      setTextSize: handleSetTextSize, 
      setFontChoice: handleSetFontChoice, 
      currency, 
      setCurrency: handleSetCurrency, 
      isDark 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
