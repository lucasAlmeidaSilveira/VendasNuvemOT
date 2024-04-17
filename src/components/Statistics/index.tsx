import React from 'react';
import { Container, ContainerOrders, ContainerGeral } from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Loading } from '../Loading';
import { FilterDate } from '../FilterDate';
import { filterOrders } from "../../tools/filterOrders";
import { useAnalytics } from "../../context/AnalyticsContext";
import { useOrders } from "../../context/OrdersContext";

export function Statistics() {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { store, orders, isLoading: isLoadingOrders, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted } = filterOrders(orders, date);
  
  // Convertendo o número de visitas para o formato local
  const visits = data.totalVisits ? parseInt(data.totalVisits).toLocaleString('pt-BR') : '0';

  const conversionRate = data.totalVisits > 0
    ? ((ordersToday.length / parseInt(data.totalVisits)) * 100).toFixed(2)
    : '0.00';

  return (
    <Container>
      <FilterDate onChange={setDate} value={date} />
      <ContainerOrders>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>
              {!isLoadingOrders && ordersToday.length} Vendas
            </div>
            <div className='text-wrapper-3'>
              {isLoadingOrders ? <Loading color={'#1F1F1F'} /> : totalOrdersFormatted}
            </div>
          </div>
        </ContainerGeral>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>
              Visitas
            </div>
            <div className='text-wrapper-3'>
              {isLoadingAnalytics ? <Loading color={'#1F1F1F'} /> : visits}
            </div>
          </div>
        </ContainerGeral>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>
              Taxa de conversão
            </div>
            <div className='text-wrapper-3'>
              {isLoadingOrders ? <Loading color={'#1F1F1F'} /> : `${conversionRate}%`}
            </div>
          </div>
        </ContainerGeral>
      </ContainerOrders>
    </Container>
  );
}
