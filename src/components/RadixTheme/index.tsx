import React, { ComponentProps } from 'react';
import { Theme } from '@radix-ui/themes';
import { useTheme } from '../../context/ThemeContext';

/**
 * <Theme> do Radix já ligado ao tema da aplicação.
 *
 * Deliberadamente NÃO existe um <Theme> na raiz em main.jsx. Dois motivos:
 *  - `.radix-themes` impõe font-size/line-height/letter-spacing próprios, e
 *    esta aplicação usa `html { font-size: 62.5% }` (1rem = 10px): um Theme
 *    raiz mudaria a tipografia do app inteiro no tema claro também;
 *  - os <Theme> espalhados pelas tabelas são hoje cada um a sua própria raiz
 *    (`data-is-root-theme`), o que lhes dá `min-height: 100vh`; aninhá-los sob
 *    um Theme raiz tiraria isso de quatro deles.
 *
 * Como `appearance` tem default "inherit" e estes já eram raiz, passar o valor
 * explícito não muda nada no claro — só acrescenta a classe `dark` no escuro.
 */
export function RadixTheme(props: ComponentProps<typeof Theme>) {
  const { theme } = useTheme();

  return <Theme appearance={theme} {...props} />;
}
