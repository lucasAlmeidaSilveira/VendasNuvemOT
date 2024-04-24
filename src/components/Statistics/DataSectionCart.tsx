import React, { useEffect, useMemo, useState } from "react";
import { BudgetItem } from "./BudgetItem";
import { ContainerOrders, ContainerGeral } from './styles';
import { useAnalytics } from "../../context/AnalyticsContext";
import { useOrders } from "../../context/OrdersContext";
import { useFilterAllOrders } from '../../hooks/useFilterAllOrders'
import { calculateAverageTicket, formatCurrency } from "../../tools/tools";
import { filterOrders } from "../../tools/filterOrders";

interface DataSectionCartProps {
  bgcolor: string;
  totalAdSpend: number;
}

export function DataSectionCart({ bgcolor, totalAdSpend }: DataSectionCartProps) {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { orders, isLoading: isLoadingOrders, date } = useOrders();
  const { ordersFiltered } = useFilterAllOrders(orders, date);
  const { ordersToday } = filterOrders(orders, date);
  const [ visits, setVisits ] = useState('0');
  const [ priceSession, setPriceSession ] = useState('R$ 0,00');
  const [ priceAcquisition, setPriceAcquisition ] = useState('R$ 0,00');
  const [ passRate, setPassRate ] = useState('0%');

  useEffect(() => {
    if (data && data.totalVisits) {
      setVisits(parseInt(data.totalVisits).toLocaleString('pt-BR'));
    }
  }, [data]); // Ajuste para apenas data como dependência

  useEffect(() => {
    const visitsNumber = parseInt(data.totalVisits);
    if (!isNaN(visitsNumber) && visitsNumber !== 0) {
      setPriceSession(formatCurrency(totalAdSpend / visitsNumber));
      setPriceAcquisition(formatCurrency(totalAdSpend / ordersFiltered.length));
    }
  }, [visits, totalAdSpend, ordersFiltered.length]); // Adicione totalAdSpend e ordersFiltered.length como dependências

  useEffect(() => {
    if (ordersFiltered.length > 0) {
      const passRateValue = (ordersToday.length / ordersFiltered.length) * 100;
      setPassRate(passRateValue.toFixed(1) + '%'); // Ajuste para fixar apenas duas casas decimais
    }
  }, [orders, ordersFiltered.length]); // Correção para incluir orders e ordersFiltered.length como dependências

  const conversionRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((ordersFiltered.length / numericVisits) * 100).toFixed(2)
      : '0.00';
  }, [ordersFiltered.length, visits]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Venda</h4>
        {/* <div className="row">
          <BudgetItem title="Carrinhos criados" value={visits} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Taxa de carrinho" value={ordersFiltered.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Custo de carrinho" value={conversionRate} isLoading={isLoadingAnalytics} />
        </div> */}
        <div className="row">
          <BudgetItem title="Vendas" value={ordersToday.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Clicado em comprar" value={ordersFiltered.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Taxa de aprovação" value={passRate} isLoading={isLoadingOrders} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}