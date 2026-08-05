import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  .last-updated{
    font-size: 1.2rem;
    color: var(--text-primary);
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  `;

export const ButtonActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface QuickActionButtonProps {
  active?: string;
}

export const QuickActionButton = styled.span<QuickActionButtonProps>`
  border-radius: .8rem;
  padding: .2rem 1rem;
  height: fit-content;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: var(--surface);
  opacity: .9;
  box-shadow: 0px 1px 4px var(--shadow-color-soft);
  transition: all 0.1s ease-in;

  &:hover {
    opacity: 1;
    box-shadow: 0px 2px 6px var(--shadow-color-soft);
  }

  ${({ active }) =>
    active &&
    css`
      background-color: var(--chip-bg);
      color: var(--chip-text);
    `}
`;
