import React from 'react';
import {
  Container,
  InputContainer,
  InputWrapper,
  InputField,
  InputLabel,
  Icon,
} from './styles';

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: InputProps) {
  return (
    <Container>
      <InputContainer>
        <InputLabel>{label}</InputLabel>
        <InputWrapper>
          {icon && <Icon>{icon}</Icon>}
          <InputField
            type='text'
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className='search-input'
          />
        </InputWrapper>
      </InputContainer>
    </Container>
  );
}
