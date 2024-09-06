import React, { useState, useEffect } from 'react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
  Container,
  ButtonsContainer,
  QuickActionButton,
  ButtonActionContainer,
} from './styles';
import { useOrders } from '../../context/OrdersContext';
import {
  StatusDataLoading,
  StatusDataSuccess,
  StatusDataWait,
  StatusInitialDataLoading,
} from '../Status';
import { formatTimeDifference } from '../../tools/tools';
import { SelectDatePicker } from '../SelectDatePicker';

export function FilterDate() {
  const {
    date,
    setDate,
    store,
    currentDateLocalStorage,
    isLoading,
    isLoadingAllOrders,
    isLoadingPeriodic,
    error,
  } = useOrders();
  const [activeButton, setActiveButton] = useState<string | null>('today');
  const [timeDifference, setTimeDifference] = useState('');

  const handleDateChange = (date: any) => {
    setActiveButton(null); // Desativar botão ativo quando a data é selecionada manualmente
    setDate(date);
  };

  useEffect(() => {
    setTimeDifference(formatTimeDifference(currentDateLocalStorage));
    const intervalId = setInterval(() => {
      if (currentDateLocalStorage) {
        setTimeDifference(formatTimeDifference(currentDateLocalStorage));
      }
    }, 30000); // 30 segundos em milissegundos

    return () => clearInterval(intervalId); // Cleanup do intervalo quando o componente desmontar
  }, [currentDateLocalStorage]);

  const handleQuickAction = (days: number, buttonId: string) => {
    let newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() - 1); // Ajusta para o dia anterior ao atual
    newEndDate.setHours(23, 59, 59, 999);
    let newStartDate = new Date(newEndDate);
    newStartDate.setDate(newEndDate.getDate() - days);
    newStartDate.setHours(0, 0, 0, 0);
    setActiveButton(buttonId);
    setDate([newStartDate, newEndDate]);
  };

  const handleTodayAction = () => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    setActiveButton('today'); // Definir botão ativo
    setDate([today, endOfToday]);
  };

  const handleYesterdayAction = () => {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    let endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    setActiveButton('yesterday'); // Definir botão ativo
    setDate([yesterday, endOfYesterday]);
  };

  const handleDateAllAction = () => {
    let initDay = new Date('2023-11-23');
    if (store === 'artepropria') {
      initDay = new Date('2023-12-30');
    }
    initDay.setHours(0, 0, 0, 0);
    let today = new Date();
    today.setHours(23, 59, 59, 999);
    setActiveButton('all'); // Definir botão ativo
    setDate([initDay, today]);
  };

  const maxSelectableDate = new Date();
  const minSelectableDate = new Date('2023-11-23');

  return (
    <Container>
      <h2>Filtro por data</h2>
      <ButtonsContainer>
        <SelectDatePicker
          onChange={handleDateChange}
          value={date}
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
          <QuickActionButton
            onClick={() => handleDateAllAction()}
            active={activeButton === 'all' ? 'true' : undefined}
          >
            Todo o período
          </QuickActionButton>
        </ButtonActionContainer>
        <span className='last-updated'>
          {isLoadingAllOrders ? (
            <StatusDataLoading
              text={'Atualizando dados...'}
              tooltip={'Atualizando dados...'}
            />
          ) : timeDifference === '0 minutos' ? (
            <StatusDataSuccess
              text={'Atualizado agora mesmo'}
              tooltip={'Os dados estão atualizados.'}
            />
          ) : (
            <StatusDataWait
              text={`Atualizado há ${timeDifference}`}
              tooltip={'Os dados estão atualizados.'}
            />
          )}
        </span>
      </ButtonsContainer>
    </Container>
  );
}
