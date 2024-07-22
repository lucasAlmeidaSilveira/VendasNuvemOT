import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex: 1;
  justify-content: right;
  align-items: flex-end;
  gap: .8rem;

  p.results {
    font-size: 12px;
  }
`

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: .4rem;
`;

export const InputLabel = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--geralblack-100);
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: .8rem;
  padding: 0.8rem 1.6rem;
  border-radius: 24px;
  border: none;
  background-color: var(--geralwhite);
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.3s ease-in-out;
  border: 1px solid transparent;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid var(--geralblack-80);
  }
`;

export const Icon = styled.div`
  color: var(--geralblack-50);
  margin-bottom: -.2rem;
`;

export const InputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.4rem;
  background: transparent;
`;