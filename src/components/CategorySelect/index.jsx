import React from 'react';
import { Container } from './styles';

// eslint-disable-next-line react/prop-types
export function CategorySelect({ options, selectedCategory, handleCategoryChange }) {
  return (
    <Container>
      <select
        name='Categoria'
        onChange={handleCategoryChange}
        value={selectedCategory}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Container>
  );
}