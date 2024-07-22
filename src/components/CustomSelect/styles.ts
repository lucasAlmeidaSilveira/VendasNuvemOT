import styled from 'styled-components';

export const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--geralblack-100);
`;

export const Select = styled.select`
  padding: 0.6rem 1.2rem;
  font-size: 1.2rem;
  border-radius: 24px;
  border: none;
  background-color: var(--geralwhite);
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  border: 1px solid transparent;
  transition: all 0.1s ease-in;
  
  &:hover {
    border: 1px solid var(--geralblack-80);
  }

  &:focus {
    border: 1px solid var(--geralblack-80);
    outline: none;
  }

`;