import React from 'react';
import { Label, Select, SelectContainer } from "./styles";

export const CustomSelect = ({ label, options, value, onChange }) => (
  <SelectContainer>
    <Label>{label}</Label>
    <Select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </SelectContainer>
);
