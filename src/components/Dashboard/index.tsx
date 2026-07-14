import React, { useEffect, useMemo } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { BestSellers } from '../BestSellers';
import { useDatabaseContext } from '../../context/DbContext';
import { DatabaseTable, OrderShop } from '../../types';
import { formatCurrency, formatDate } from '../../tools/tools';

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export function Dashboard() {
  // Período e loja vêm dos filtros globais (OrdersContext).
  const { date, store } = useOrders();
  const { user } = useAuth();
  const { state, fetchData, reloadKey } = useDatabaseContext();
  const { data, loading, error, currentTable } = state;

  // Loading efetivo: enquanto o estado compartilhado do DbContext ainda não
  // aponta para a NOSSA tabela (null no 1º paint, ou a tabela da aba anterior)
  // ou está carregando, mostramos spinner em vez de piscar "0 Vendas".
  const isBusy = loading || currentTable !== DatabaseTable.ORDERS_SHOP;

  // KPIs replicando a lógica LEGADA (tools/filterOrders) sobre `orders_shop`,
  // para imprimir o MESMO resultado do legado. Voltamos à soma client-side
  // (antes evitada por causa do created_at corrompido — §3) porque o created_at
  // já foi corrigido no backend, então o filtro por data está correto.
  // Regras do filterOrders: exclui método 'other' (parcerias); "Geral (qtd)"
  // exclui cancelado (active=0) e estornado (voided); "Pago" exige paid.
  // OBS: Loja Física/Chatbot (storefront) eram somados no legado mas são
  // pedidos manuais descontinuados — não existem no orders_shop (ecommerce).
  useEffect(() => {
    if (!user) return; // aguarda autenticação; refetch quando `user` muda
    const startDate = formatDate(date[0]);
    const endDate = formatDate(date[1]);
    fetchData(DatabaseTable.ORDERS_SHOP, { startDate, endDate, store });
  }, [date, store, user, fetchData, reloadKey]);

  const kpis = useMemo(() => {
    if (currentTable !== DatabaseTable.ORDERS_SHOP || !Array.isArray(data)) {
      return { pagoCount: 0, pagoValue: 0, geralCount: 0, geralValue: 0 };
    }

    const rows = data as OrderShop[];
    // ordersAllToday: exclui apenas parcerias (base do "Geral (valor)").
    const ordersAllToday = rows.filter((o) => o.payment_method !== 'other');
    // ordersToday: também exclui cancelado (active=0) e estornado (voided).
    const ordersToday = ordersAllToday.filter(
      (o) => Number(o.active) === 1 && o.payment_status !== 'voided',
    );
    // ordersTodayPaid: somente pagos.
    const ordersTodayPaid = ordersToday.filter(
      (o) => o.payment_status === 'paid',
    );

    return {
      // Pago = qtd e soma dos pedidos pagos (= totalPaidAllAmountEcom do legado).
      pagoCount: ordersTodayPaid.length,
      pagoValue: ordersTodayPaid.reduce((acc, o) => acc + toNumber(o.total), 0),
      // Geral = qtd de pedidos (excl. cancelado/estornado) e soma de TODOS os
      // pedidos do período (= ordersToday.length / sum(ordersAllToday) do legado).
      geralCount: ordersToday.length,
      geralValue: ordersAllToday.reduce((acc, o) => acc + toNumber(o.total), 0),
    };
  }, [data, currentTable]);

  return (
    <Container>
      <ContainerOrders>
        <ContainerPago>
          <div className='text-wrapper'>Pago</div>
          <div className='div'>
            <div className='text-wrapper-2'>
              {isBusy ? (
                <Loading bgColor='#FCFAFB' />
              ) : (
                `${kpis.pagoCount} Vendas`
              )}
            </div>
            <div className='text-wrapper-3'>
              {isBusy ? <Loading /> : formatCurrency(kpis.pagoValue)}
            </div>
          </div>
        </ContainerPago>
        <ContainerGeral>
          <div className='text-wrapper'>Geral</div>
          <div className='div'>
            <div className='text-wrapper-2'>
              {isBusy ? <Loading /> : `${kpis.geralCount} Vendas`}
            </div>
            <div className='text-wrapper-3'>
              {isBusy ? <Loading /> : formatCurrency(kpis.geralValue)}
            </div>
          </div>
        </ContainerGeral>
      </ContainerOrders>

      {error && (
        <div style={{ color: 'var(--uidanger-100, #d32f2f)', fontSize: 14 }}>
          Não foi possível carregar os indicadores de vendas.
        </div>
      )}

      <BestSellers />
    </Container>
  );
}
