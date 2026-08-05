/**
 * Espelho em JS dos tokens semânticos definidos em src/index.css.
 *
 * Existe porque duas bibliotecas não conseguem ler CSS custom properties:
 *  - recharts: CartesianGrid/XAxis/Cell viram atributos de apresentação SVG,
 *    onde `var()` não é valor válido;
 *  - MUI createTheme: roda alpha()/darken()/lighten() sobre os valores da
 *    paleta, e esses parsers não entendem `var()`.
 *
 * Qualquer mudança aqui precisa ser refletida em src/index.css e vice-versa.
 */

export type ThemeMode = 'light' | 'dark';

export const tokens = {
  light: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f1f0f2',
    surface: '#fcfafb',
    surface2: '#f1f0f2',
    surface3: '#e0e0e0',
    surfaceHover: '#ebebeb',

    textDefault: '#000000',
    textPrimary: '#1f1f1f',
    textSecondary: '#525252',
    textTertiary: '#5c5c5c',
    textMuted: '#a3a3aa',

    borderStrong: '#333333',
    borderSubtle: '#d6d6d6',
    borderHairline: '#dddddd',

    chipBg: '#1f1f1f',
    chipText: '#fcfafb',

    accent: '#1874cd',
    accentHover: '#0c59a5',
    onAccent: '#ffffff',

    tableHeadBg: '#d6d6d6',
    tableHeadText: '#1f1f1f',

    chartGrid: '#cccccc',
    chartAxis: '#666666',
    chartTooltipBg: '#ffffff',
    chartTooltipBorder: '#cccccc',
  },
  dark: {
    bgPrimary: '#121212',
    bgSecondary: '#1a1a1a',
    surface: '#1e1e1e',
    surface2: '#242424',
    surface3: '#2e2e2e',
    surfaceHover: '#2a2a2a',

    textDefault: '#e8e8e8',
    textPrimary: '#e8e8e8',
    textSecondary: '#b3b3b3',
    textTertiary: '#a0a0a0',
    textMuted: '#8a8a8a',

    borderStrong: '#5a5a5a',
    borderSubtle: '#3a3a3a',
    borderHairline: '#2e2e2e',

    chipBg: '#2b2b2b',
    chipText: '#f5f5f5',

    accent: '#4a9eff',
    accentHover: '#7ab8ff',
    onAccent: '#10233b',

    tableHeadBg: '#2e2e2e',
    tableHeadText: '#e8e8e8',

    chartGrid: '#3a3a3a',
    chartAxis: '#8a8a8a',
    chartTooltipBg: '#242424',
    chartTooltipBorder: '#3a3a3a',
  },
} as const;

export type Tokens = (typeof tokens)['light'];

export const getTokens = (mode: ThemeMode): Tokens => tokens[mode];
