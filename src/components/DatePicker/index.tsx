import React, { useState } from 'react';
import { DatePickerProps } from '../../types';
import './style.css';

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="date-picker-container">
      {label && <label className="date-picker-label">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={handleDateChange}
        className="date-picker-input"
      />
    </div>
  );
};
