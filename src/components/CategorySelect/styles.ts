import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  select {
    border-radius: 1.2rem;
    width: max-content;
    padding: .4rem 1rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
    
    /* este select fica sobre um chip escuro, então a cor clara vale nos dois
       temas — quem acompanha o tema é a lista suspensa nativa */
    background-color: rgba(255, 255, 255, .2);
    color: var(--chip-text);
    border: none;
    box-shadow: 0px 1px 4px var(--shadow-color-soft);

    /* o Chromium tira o fundo da lista do background-color declarado no select —
       translúcido aqui, ele pinta a lista clara mesmo com color-scheme: dark, e o
       texto claro do tema escuro sumia. Fundo opaco explícito resolve. */
    option,
    optgroup {
      background-color: var(--surface);
      color: var(--text-primary);
    }

    option:checked {
      background-color: var(--surface-2);
    }
  }
`