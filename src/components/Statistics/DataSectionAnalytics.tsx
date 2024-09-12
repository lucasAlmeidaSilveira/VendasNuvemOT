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
  const { data, isLoadingADSGoogle: isLoadingAnalytics } = useAnalytics();
  const { allOrders, isLoadingAllOrders: isLoadingOrders, date } = useOrders();
  const { ordersToday } = filterOrders(allOrders, date);
  const [visits, setVisits] = useState('-');
  const [priceSession, setPriceSession] = useState('R$ -');
  const [priceAcquisition, setPriceAcquisition] = useState('R$ -');
  const [averageTicket, setAverageTicket] = useState('R$ -');

  useEffect(() => {
      setVisits(parseInt(data.totalVisits).toLocaleString('pt-BR'));
  }, [data]);

  useEffect(() => {
    setPriceSession('R$ -')
    const visitsNumber = parseInt(visits.replace(/\D/g, ''));
    if (!isNaN(visitsNumber) && visitsNumber !== 0) {
      setPriceSession(formatCurrency(totalAdSpend / visitsNumber));
    }
  }, [visits, totalAdSpend]);

  useEffect(() => {
    const ordersLength = ordersToday.length;
    if (ordersLength !== 0) {
      setPriceAcquisition(formatCurrency(totalAdSpend / ordersLength));
    } else {
      setPriceAcquisition('R$ 0,00');
    }
  }, [ordersToday.length, totalAdSpend]);

  useEffect(() => {
    const ticket = calculateAverageTicket(ordersToday);
    setAverageTicket(formatCurrency(ticket));
  }, [date]);

  const conversionRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((ordersToday.length / numericVisits) * 100).toFixed(2) + '%'
      : '0.00%';
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
          <BudgetItem title="Custo p/ Sessão (CPS)" tooltip="Verba Total / Visitas" value={priceSession} isLoading={isLoadingOrders} />
          <BudgetItem title="Custo p/ Aquisição (CPA)" tooltip="Verba Total / Vendas" value={priceAcquisition} isLoading={isLoadingOrders} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
