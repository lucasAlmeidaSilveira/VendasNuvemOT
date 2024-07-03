import React, { useEffect, useMemo, useState } from "react";
import { BudgetItem } from "./BudgetItem";
import { ContainerOrders, ContainerGeral } from './styles';
import { useAnalytics } from "../../context/AnalyticsContext";
import { useOrders } from "../../context/OrdersContext";
import { filterOrders } from "../../tools/filterOrders";
import { calculateAverageTicket, formatCurrency } from "../../tools/tools";

interface DataSectionAnalyticsProps {
  bgcolor: string;
  totalAdSpend: number;
}

export function DataSectionAnalytics({ bgcolor, totalAdSpend }: DataSectionAnalyticsProps) {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { orders, isLoading: isLoadingOrders, date, setDate } = useOrders();
  const { ordersToday } = filterOrders(orders, date);
  const [visits, setVisits] = useState('0');
  const [priceSession, setPriceSession] = useState('R$ 0,00');
  const [priceAcquisition, setPriceAcquisition] = useState('R$ 0,00');
  const [averageTicket, setAverageTicket] = useState('R$ 0,00');

  useEffect(() => {
    if (data && data.totalVisits) {
      setVisits(parseInt(data.totalVisits).toLocaleString('pt-BR'));
    }
  }, [data]); // Ajuste para apenas data como dependência

  useEffect(() => {
    const visitsNumber = parseInt(data.totalVisits);
    if (!isNaN(visitsNumber) && visitsNumber !== 0) {
      setPriceSession(formatCurrency(totalAdSpend / visitsNumber));
      setPriceAcquisition(formatCurrency(totalAdSpend / ordersToday.length));
    }
  }, [visits, totalAdSpend, ordersToday.length]); // Adicione totalAdSpend e ordersToday.length como dependências

  useEffect(() => {
    const ticket = calculateAverageTicket(ordersToday);
    setAverageTicket(formatCurrency(ticket));
  }, [ordersToday]); // Correção para incluir ordersToday como dependência

  const conversionRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((ordersToday.length / numericVisits) * 100).toFixed(2) + '%'
      : '0.00';
  }, [ordersToday.length, visits]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Analytics</h4>
        <div className="row">
          <BudgetItem title="Visitas" tooltip="Google Analytics" value={visits} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Vendas" tooltip="Nuvemshop (Geral)" value={ordersToday.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Taxa de conversão" tooltip="Visitas x Vendas" value={conversionRate} isLoading={isLoadingOrders} />
        </div>
        <div className="row">
          <BudgetItem title="Ticket Médio" tooltip="Nuvemshop" value={averageTicket} isLoading={isLoadingOrders} />
          <BudgetItem title="Custo p/ Sessão (CPS)" tooltip="Faturamento x Visitas" value={priceSession} isLoading={isLoadingOrders} />
          <BudgetItem title="Custo p/ Aquisição (CPA)" tooltip="Faturamento x Vendas" value={priceAcquisition} isLoading={isLoadingOrders} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}