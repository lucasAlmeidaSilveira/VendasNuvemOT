import * as React from 'react';
import DatePicker from "react-date-picker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Container } from "./styles";

export function FilterDate({onChange, value}) {
  return (
    <Container>
      <h2>Filtro por data</h2>
      <DatePicker calendarClassName='calendar-view' className='calendar' format="dd/MM/yyyy" onChange={onChange} value={value} clearIcon={null}/>
    </Container>
  );
}