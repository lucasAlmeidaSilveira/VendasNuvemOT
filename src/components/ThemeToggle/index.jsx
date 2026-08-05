import React from 'react';
import './style.css';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { TooltipInfo } from '../TooltipInfo';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TooltipInfo title={isDark ? 'Tema claro' : 'Tema escuro'}>
      <button
        className="boxTheme"
        onClick={toggleTheme}
        aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        aria-pressed={isDark}
      >
        {isDark ? (
          <FiSun color="#FCFAFB" fontSize="22" />
        ) : (
          <FiMoon color="#FCFAFB" fontSize="22" />
        )}
      </button>
    </TooltipInfo>
  );
}
