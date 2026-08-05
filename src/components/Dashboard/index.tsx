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
import { DatabaseTable, DailySale } from '../../types';
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
  const isBusy = loading || currentTable !== DatabaseTable.DAILY_SALES;

  // KPIs vêm PRÉ-AGREGADOS de `daily_sales` (uma linha por dia/loja), por
  // services/dailySalesRecalc.js. "Geral (qtd)" conta TODO pedido do dia — parceria,
  // cancelado e estornado inclusive — para bater com o "(Total de N pedidos)" da aba
  // Pedidos. "Geral (valor)" e "Pago" excluem parcerias (permuta, sem receita), e "Pago"
  // ainda exige paid e não-cancelado. Aqui só somamos as linhas-dia do período selecionado.
  // OBS: Loja Física/Chatbot (storefront 'Loja Fisica'/'Loja') ENTRAM nesses totais, como no
  // legado — são pedidos manuais ativos, criados pelo popup e pelo Apps Script das filiais.
  // O dia de cada linha é o dia-calendário BRT (00:00–23:59 SP), a mesma regra da listagem
  // de pedidos e da aba Estatísticas.
  useEffect(() => {
    if (!user) return; // aguarda autenticação; refetch quando `user` muda
    const startDate = formatDate(date[0]);
    const endDate = formatDate(date[1]);
    fetchData(DatabaseTable.DAILY_SALES, { startDate, endDate, store });
  }, [date, store, user, fetchData, reloadKey]);

  const kpis = useMemo(() => {
    if (currentTable !== DatabaseTable.DAILY_SALES || !Array.isArray(data)) {
      return { pagoCount: 0, pagoValue: 0, geralCount: 0, geralValue: 0 };
    }

    const rows = data as DailySale[];
    // Soma das linhas-dia do período: Pago e Geral (qtd/valor) já calculados na origem.
    return rows.reduce(
      (acc, r) => ({
        pagoCount: acc.pagoCount + toNumber(r.total_paid_orders),
        pagoValue: acc.pagoValue + toNumber(r.total_paid_money),
        geralCount: acc.geralCount + toNumber(r.total_orders),
        geralValue: acc.geralValue + toNumber(r.total_money),
      }),
      { pagoCount: 0, pagoValue: 0, geralCount: 0, geralValue: 0 },
    );
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
