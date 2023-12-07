import React from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Container } from './styles';

export function FilterDate({ onChange, value }) {
  const [startDate, endDate] = value;

  const handleDateChange = (date) => {
    onChange(date);
  };

  const maxSelectableDate = new Date(); // Adicione a data máxima desejada aqui
  const minSelectableDate = new Date("2023-11-23"); // Adicione a data máxima desejada aqui

  return (
    <Container>
      <h2>Filtro por data</h2>
      <DatePicker
        calendarClassName="calendar-view"
        className="calendar"
        selectRange={true}
        format="dd/MM/yyyy"
        onChange={handleDateChange}
        value={value}
        clearIcon={null}
        maxDate={maxSelectableDate}
        minDate={minSelectableDate}
      />
    </Container>
  );
}
