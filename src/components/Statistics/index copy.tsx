import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  ContainerOrders,
  ContainerGeral,
  ContainerCharts,
} from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Loading } from '../Loading';
import { FilterDate } from '../FilterDate';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine } from "../Chart";

export function Statistics() {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { store, orders, isLoading: isLoadingOrders, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted } = filterOrders(orders, date);
  const [ usersByDevice, setUsersByDevice ] = useState({});
  const [ visits, setVisits ] = useState('0');

  useEffect(() => {
    setVisits(parseInt(data.totalVisits).toLocaleString('pt-BR'));
    setUsersByDevice(data.usersByDevice);
  }, [data, store]); // Correção para dependências corretas

  const conversionRate = useMemo(() => (
    parseInt(visits.replace(/\D/g, '')) > 0
      ? ((ordersToday.length / parseInt(visits.replace(/\D/g, ''))) * 100).toFixed(2)
      : '0.00'
  ), [ordersToday.length, visits]); // Uso de useMemo para otimização

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
            <div className='text-wrapper-2'>Visitas</div>
            <div className='text-wrapper-3'>
              {isLoadingAnalytics ? <Loading color={'#1F1F1F'} /> : visits}
            </div>
          </div>
        </ContainerGeral>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>Taxa de conversão</div>
            <div className='text-wrapper-3'>
              {isLoadingAnalytics ? <Loading color={'#1F1F1F'} /> : `${conversionRate}%`}
            </div>
          </div>
        </ContainerGeral>
      </ContainerOrders>
          <ContainerCharts>
            <Chart title={'Sessões por dispositivo'} usersByDevice={usersByDevice} loading={isLoadingAnalytics} />
            <ChartLine title={'Compras por hora'} orders={orders} loading={isLoadingOrders} />
            {/* <Chart title={'Sessões por dispositivo'} usersByDevice={usersByDevice}  /> */}
          </ContainerCharts>
    </Container>
  );
}
