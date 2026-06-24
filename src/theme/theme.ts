// src/theme/theme.ts

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  mode: 'light' as ThemeMode,

  colors: {
    background: '#F4F1EC',
    surface: '#FFFFFF',
    surfaceAlt: '#E8E2DA',

    primary: '#2F2A26',
    primarySoft: '#7A6F66',
    accent: '#A58E76',

    text: '#26221F',
    textMuted: '#746B63',

    border: '#D8D0C7',

    danger: '#A14A3F',
    success: '#63735E',
    warning: '#B08A4A',

    white: '#FFFFFF',
    black: '#000000',
  },
};

export const darkTheme = {
  mode: 'dark' as ThemeMode,

  colors: {
    background: '#171513',
    surface: '#24211E',
    surfaceAlt: '#302C28',

    primary: '#EFE8DF',
    primarySoft: '#B7AA9C',
    accent: '#C4AA8C',

    text: '#F7F1EA',
    textMuted: '#B8AEA4',

    border: '#403A35',

    danger: '#E38D82',
    success: '#A1B596',
    warning: '#D1AD68',

    white: '#FFFFFF',
    black: '#000000',
  },
};

export type AppTheme = typeof lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
};