import styled from 'styled-components';

export const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  `;

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
`;

export const Select = styled.select`
  padding: 0.4rem 0.8rem;
  width: 14rem;
  font-size: 1.2rem;
  border-radius: 24px;
  border: none;
  background-color: var(--surface);
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  box-shadow: 0px 1px 4px var(--shadow-color-soft);
  border: 1px solid transparent;
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid var(--border-strong);
  }

  &:focus {
    border: 1px solid var(--border-strong);
    outline: none;
  }
`;
