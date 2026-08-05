import styled from "styled-components";

export const ButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .8rem;
  padding: 8px 16px;
  font-size: 1.2rem;
  background-color: var(--chip-bg);
  color: var(--chip-text);
  border: none;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0px 1px 4px var(--shadow-color-soft);

  transition: all .2s ease-in-out;

  &:hover {
    background-color: var(--chip-bg-hover);
    box-shadow: 0px 2px 4px var(--shadow-color-soft);
  }

  &.simple {
    background-color: var(--surface-hover);
    color: var(--text-primary);
    opacity: 1;

    &:hover {
      opacity: .9;
    }
  }

  &.confirm {
    background-color: var(--chip-bg);
    color: var(--chip-text);
    opacity: 1;

    &:hover {
      opacity: .9;
    }
  }

  &.delete {
    background-color: var(--uinegative-100);
    color: var(--on-accent);
    opacity: .4;
    padding: .8rem;

    &:hover {
      opacity: 1;
    }
  }
`