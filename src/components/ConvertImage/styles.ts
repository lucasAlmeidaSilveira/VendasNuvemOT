import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`

export const BoxInput = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 16px; /* Bordas arredondadas */
  transition: border-color .2s;
  
  &.isDragging {
    label {
      background-color: var(--geralblack-80); /* Cor do fundo */
    }
  }
  
  label {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .8rem;
    padding: 40px 24px;
    background-color: var(--geralblack-100); /* Cor do fundo */
    border-radius: 16px; /* Bordas arredondadas */
    border: 3px dashed var(--geralwhite); /* Borda transparente */
    cursor: pointer;

    color: var(--geralwhite);
    font-size: 14px;
    font-weight: 500;
    white-space: normal; /* Permite que o texto quebre */
    word-wrap: break-word; /* Quebra o texto automaticamente */
    word-break: break-all; /* Quebra palavras longas */
    max-width: 100%; /* Limita o tamanho máximo do conteúdo */
    transition: all .2s ease-in;
  }
`

export const InputImage = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: .8rem;
`