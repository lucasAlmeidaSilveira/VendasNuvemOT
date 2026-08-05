import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { tokens, getTokens } from '../theme/tokens';
import { getMuiTheme } from '../theme/muiTheme';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

/**
 * Cores do tema em hex literal, para quem não consegue ler `var()` —
 * principalmente o recharts, que renderiza atributos de apresentação SVG.
 */
export const useThemeTokens = () => getTokens(useTheme().theme);

const STORAGE_KEY = 'theme';

// ATENÇÃO: esta leitura é duplicada no script inline do <head> de index.html,
// que roda antes do CSS para evitar o flash de tema errado. Se a chave ou a
// regra de fallback mudar aqui, mude lá também.
const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    // localStorage lança em modo restrito / cookies bloqueados
    return null;
  }
};

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getStoredTheme() ?? getSystemTheme());
  // Enquanto o usuário não clicar no interruptor, a aplicação continua
  // acompanhando o tema do sistema operacional em tempo real.
  const [isExplicit, setIsExplicit] = useState(() => getStoredTheme() !== null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    // O Header é sticky no topo, então é a cor dele que fica sob a barra do
    // navegador — por isso o theme-color segue --chip-bg, não o fundo da página.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', tokens[theme].chipBg);
  }, [theme]);

  useEffect(() => {
    if (isExplicit) return undefined;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setTheme(event.matches ? 'dark' : 'light');

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [isExplicit]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // sem persistência, o tema vale só para esta sessão
      }
      return next;
    });
    setIsExplicit(true);
  };

  // O MUI não lê CSS custom properties na paleta, então precisa do seu próprio
  // tema seguindo o mesmo estado. Fica aqui dentro para que main.jsx monte um
  // provider só.
  const muiTheme = useMemo(() => getMuiTheme(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isExplicit }}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
