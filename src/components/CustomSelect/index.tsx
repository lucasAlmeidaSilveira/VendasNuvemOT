import React from 'react';
import { Label, Select, SelectContainer } from './styles';

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: () => void
}

interface Option {
  label: string;
  value: string;
}

export function CustomSelect({ label, options, value, onChange }: CustomSelectProps) {
  return (
    <SelectContainer>
      <Label>{label}
      <Select value={value} onChange={onChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      </Label>
    </SelectContainer>
  );
}
