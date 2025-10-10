import React from 'react';
import {
  Container,
  InputContainer,
  InputWrapper,
  InputField,
  InputLabel,
  Icon,
} from './styles';
import { FiSearch } from 'react-icons/fi';

interface InputSearchProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  totalList?: number;
}

export function InputSearch({
  label,
  value,
  onChange,
  placeholder,
  totalList,
}: InputSearchProps) {
  return (
    <Container>
      <InputContainer>
        <InputLabel>{label}</InputLabel>
        <InputWrapper>
          <Icon>
            <FiSearch size={16} />
          </Icon>
          <InputField
            type='text'
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className='search-input'
          />
        </InputWrapper>
      </InputContainer>
      {totalList && <p className='results'>(Total de {totalList} pedidos)</p>}
    </Container>
  );
}
