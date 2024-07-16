import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  .calendar {
    flex: 1;
  }

  .react-date-picker__wrapper {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: 0.8rem 1.6rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.6rem;
    background-color: #f1f0f2;
    border: none;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  }

  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: #fcfafb;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);

    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: var(--geralblack-100);

      span {
        font-size: 1.4rem;
        text-transform: uppercase;
      }
    }
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
  background-color: #f1f0f2;
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
