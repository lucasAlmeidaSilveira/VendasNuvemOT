import React from 'react';
import { Container } from './styles';

// eslint-disable-next-line react/prop-types
export function CategorySelect({ selectedCategory, handleCategoryChange }) {
  const categoryOptions = [
    { value: 'Quadro Decorativo', label: 'Quadro' },
    { value: 'Espelho', label: 'Espelho' },
  ];

  return (
    <Container>
      <select
        name='Categoria'
        onChange={handleCategoryChange}
        value={selectedCategory}
      >
        {categoryOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Container>
  );
}
