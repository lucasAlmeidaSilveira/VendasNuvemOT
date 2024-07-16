import styled from 'styled-components';

export const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
`;

export const Select = styled.select`
  padding: 0.6rem 1.2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: none;
  background-color: #f1f1f1;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  box-shadow: 0px 1px 4px rgba(0,0,0,0.25);
  transition: all 0.1s ease-in;
  
  &:hover {
    background-color: #e1e1e1;
    box-shadow: 0px 2px 6px rgba(0,0,0,0.25);
  }

  &:focus {
    border: none;
    outline: none;
  }

`;