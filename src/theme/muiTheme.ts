import { createTheme } from '@mui/material/styles';
import { tokens, ThemeMode } from './tokens';

/**
 * Tema do MUI por modo.
 *
 * Regras que garantem que o tema claro não mude nada:
 *  1. o modo claro é `createTheme({ palette: { mode: 'light' } })` SEM nenhum
 *     override — idêntico ao tema default implícito que a aplicação usava antes
 *     de existir um ThemeProvider;
 *  2. só o modo escuro carrega valores, e sempre em hex literal vindo de
 *     tokens.ts — nunca `var()`, porque o MUI roda alpha()/darken()/lighten()
 *     sobre a paleta (hover de TableRow, elevação de Menu) e esses parsers não
 *     entendem custom properties.
 *
 * Sem isto, no escuro quebram: Tabs/Tab (Footer), Skeleton (Loading), Menu e
 * Divider (User), os Dialog Paper, TableCell/TablePagination e o PieChart do
 * @mui/x-charts — todos leem a paleta do tema, não o CSS.
 */

const dark = tokens.dark;

const lightTheme = createTheme({
  palette: { mode: 'light' },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: dark.accent, contrastText: dark.onAccent },
    background: { default: dark.bgPrimary, paper: dark.surface },
    text: {
      primary: dark.textPrimary,
      secondary: dark.textSecondary,
      disabled: dark.textMuted,
    },
    divider: dark.borderSubtle,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export const getMuiTheme = (mode: ThemeMode) =>
  mode === 'dark' ? darkTheme : lightTheme;
