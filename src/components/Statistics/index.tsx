import React, { useEffect, useState } from 'react';
import {
  Container,
  ContainerOrders,
  ContainerGeral,
} from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Loading, LoadingIcon } from '../Loading';
import { FilterDate } from '../FilterDate';
import { useOrders } from '../../context/OrdersContext';
import { filterOrders } from "../../tools/filterOrders";
import { fetchVisits } from "../../api";

export function Statistics() {
  const { orders, isLoading, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted } = filterOrders(orders, date)
  const [ visits, setVisits ] = useState(7234);
  
  const conversionRate = visits > 0 ? ((ordersToday.length / visits) * 100).toFixed(2) : 0

  return (
    <Container>
      <FilterDate onChange={setDate} value={date} />
      <ContainerOrders>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>
              {!isLoading && `${ordersToday.length} Vendas`}
            </div>
            <div className='text-wrapper-3'>
              {isLoading ? <Loading color={'#1F1F1F'} /> : totalOrdersFormatted}
            </div>
          </div>
        </ContainerGeral>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>
              Visitas
            </div>
            <div className='text-wrapper-3'>
              {visits}
            </div>
          </div>
        </ContainerGeral>
        <ContainerGeral>
          <div className='div'>
            <div className='text-wrapper-2'>
              Taxa de conversão
            </div>
            <div className='text-wrapper-3'>
              {conversionRate}
            </div>
          </div>
        </ContainerGeral>
      </ContainerOrders>
    </Container>
  );
}
