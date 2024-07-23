import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  .last-updated{
    font-size: 1.2rem;
    color: var(--geralblack-100);
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
  background-color: var(--geralwhite);
  opacity: .9;
  box-shadow: 0px 1px 4px rgba(0,0,0,0.25);
  transition: all 0.1s ease-in;
  
  &:hover {
    opacity: 1;
    box-shadow: 0px 2px 6px rgba(0,0,0,0.25);
  }

  ${({ active }) =>
    active &&
    css`
      background-color: var(--geralblack-100);
      color: #fcfafb;
    `}
`;
