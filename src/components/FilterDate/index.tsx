import React, { useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Container, ButtonsContainer, QuickActionButton, ButtonActionContainer } from './styles';

interface FilterDateProps {
  onChange: (date: [Date, Date]) => void;
  value: [Date, Date];
}

export const FilterDate: React.FC<FilterDateProps> = ({ onChange, value }) => {
  const [startDate, endDate] = value;
  const [activeButton, setActiveButton] = useState<string | null>('today');

  const handleDateChange = (date: any) => {
    setActiveButton(null); // Desativar botão ativo quando a data é selecionada manualmente
    onChange(date);
  };

  const handleQuickAction = (days: number, buttonId: string) => {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() - 1); // Ajusta para o dia anterior ao atual
    newEndDate.setHours(23, 59, 59, 999);
    const newStartDate = new Date(newEndDate);
    newStartDate.setDate(newEndDate.getDate() - days);
    newStartDate.setHours(0, 0, 0, 0);
    setActiveButton(buttonId);
    onChange([newStartDate, newEndDate]);
  };

  const handleTodayAction = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    setActiveButton('today'); // Definir botão ativo
    onChange([today, endOfToday]);
  };

  const handleYesterdayAction = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    setActiveButton('yesterday'); // Definir botão ativo
    onChange([yesterday, endOfYesterday]);
  };

  const maxSelectableDate = new Date();
  const minSelectableDate = new Date('2023-11-23');

  return (
    <Container>
      <h2>Filtro por data</h2>
      <ButtonsContainer>
        <DatePicker
          calendarClassName='calendar-view'
          className='calendar'
          selectRange={true}
          format='dd/MM/yyyy'
          onChange={handleDateChange}
          value={value}
          clearIcon={null}
          maxDate={maxSelectableDate}
          minDate={minSelectableDate}
        />
        <ButtonActionContainer>
          <QuickActionButton
            onClick={handleTodayAction}
            active={activeButton === 'today' ? 'true' : undefined}
          >
            Hoje
          </QuickActionButton>
          <QuickActionButton
            onClick={handleYesterdayAction}
            active={activeButton === 'yesterday' ? 'true' : undefined}
          >
            Ontem
          </QuickActionButton>
          <QuickActionButton
            onClick={() => handleQuickAction(6, 'last7days')}
            active={activeButton === 'last7days' ? 'true' : undefined}
          >
            Últimos 7 dias
          </QuickActionButton>
          <QuickActionButton
            onClick={() => handleQuickAction(31, 'last31days')}
            active={activeButton === 'last31days' ? 'true' : undefined}
          >
            Últimos 31 dias
          </QuickActionButton>
        </ButtonActionContainer>
      </ButtonsContainer>
    </Container>
  );
};
