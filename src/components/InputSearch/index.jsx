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

export function InputSearch({
  label,
  value,
  onChange,
  placeholder,
  totalList,
}) {
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
      <p className='results'>(Total de {totalList} pedidos)</p>
    </Container>
  );
}
