import React, { useEffect } from 'react';
import {
  Container,
  ContainerOrders,
  ContainerPago,
  ContainerGeral,
} from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Loading } from '../Loading';
import { useOrders } from '../../context/OrdersContext';
import { BestSellers } from '../BestSellers';
import { filterOrders } from '../../tools/filterOrders';

export function Dashboard() {
  const { allOrders, isLoading, date } = useOrders();
  const {
    ordersToday,
    ordersTodayPaid,
    totalOrdersFormatted,
    totalPaidAmountFormatted,
    totalPaidAllAmountEcom,
    totalPaidAmountChatbot,
    totalRecorrentesClientesChatbot,
    totalRevenue,
    totalPaidAmount,
    totalNovosClientes,
    totalOrders,
  } = filterOrders(allOrders, date);

  const totalChatbot = totalPaidAmountChatbot + totalRecorrentesClientesChatbot;
  const totalLojaFisica =
    totalRevenue +
    totalNovosClientes 

  //valor total de orders pagas somando o valor de vendas de clientes novos
  const totalOrdersPaidAll = (
    totalPaidAllAmountEcom +
    totalChatbot +
    totalLojaFisica
  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  //valor total de orders totais, somando o valor de vendas de clientes novos
  const totalOrdersAll = (totalOrders + totalNovosClientes + totalRecorrentesClientesChatbot).toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' },
  );
  // função para mapear pedidos
  /*
  useEffect(() => {
    const calculateTotal = (orders) =>
      orders.reduce((total, order) => total + parseFloat(order.total), 0);
    console.log(
      calculateTotal(
        ordersToday.filter((order) => order.payment_status === 'paid'),
      ),
    );

    ordersToday.map((order, index) =>
      console.log(
        'DEBUG Type of:',
        index,
        'Nome: ' + order.customer.name,
        'Data' + order.created_at,
        'Price: ' + order.total,
        'Tipo: ' + typeof order.products[0].price,
      ),
    );
  }, [date]);
*/
  return (
    <Container>
      <ContainerOrders>
        <ContainerPago>
          <div className='text-wrapper'>Pago</div>
          <div className='div'>
            <div className='text-wrapper-2'>
              {isLoading ? (
                <Loading bgColor='#FCFAFB' />
              ) : (
                `${ordersTodayPaid.length} Vendas`
              )}
            </div>
            <div className='text-wrapper-3'>
              {isLoading ? <Loading /> : totalOrdersPaidAll}
            </div>
          </div>
        </ContainerPago>
        <ContainerGeral>
          <div className='text-wrapper'>Geral</div>
          <div className='div'>
            <div className='text-wrapper-2'>
              {isLoading ? <Loading /> : `${ordersToday.length} Vendas`}
            </div>
            <div className='text-wrapper-3'>
              {isLoading ? <Loading /> : totalOrdersAll}
            </div>
          </div>
        </ContainerGeral>
      </ContainerOrders>

      <BestSellers />
    </Container>
  );
}
