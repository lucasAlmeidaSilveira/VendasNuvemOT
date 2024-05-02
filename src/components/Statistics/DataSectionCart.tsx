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

const DEFAULT_VALUE = '0';
const DEFAULT_PERCENTAGE = '0%';

export function DataSectionCart({ bgcolor, totalAdSpend }: DataSectionCartProps) {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { orders, isLoading: isLoadingOrders, date } = useOrders();
  const { ordersToday } = filterOrders(orders, date);
  const { ordersFiltered } = useFilterAllOrders(orders, date);
  const [visits, setVisits] = useState(DEFAULT_VALUE);
  const [carts, setCarts] = useState(DEFAULT_VALUE);
  const [ beginCheckout, setBeginCheckout] = useState(DEFAULT_VALUE);
  const [passRate, setPassRate] = useState(DEFAULT_PERCENTAGE);
  const [costCarts, setCostCart] = useState(DEFAULT_VALUE);

  useEffect(() => {
    if (data) {
      const { totalVisits, carts, beginCheckout } = data;
      setVisits(parseInt(totalVisits).toLocaleString('pt-BR'));
      setCarts(parseInt(carts).toLocaleString('pt-BR'));
      setBeginCheckout(parseInt(beginCheckout).toLocaleString('pt-BR'));
    }
  }, [data]); 

  useEffect(() => {
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    setCostCart(formatCurrency(totalAdSpend / numericCarts));
  }, [carts, totalAdSpend]); 

  useEffect(() => {
    if (ordersFiltered.length > 0) {
      const passRateValue = (ordersToday.length / ordersFiltered.length) * 100;
      setPassRate(passRateValue.toFixed(1) + '%');
    }
  }, [orders, ordersFiltered]); 

  const cartRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((numericCarts / numericVisits) * 100).toFixed(2) + '%'
      : '0.00';
  }, [carts, visits]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Venda</h4>
        <div className="row">
          <BudgetItem title="Carrinhos criados" tooltip="Google Analytics" value={carts} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Taxa de carrinho" tooltip="Carrinhos x Visitas" value={cartRate} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Custo de carrinho" tooltip="Vendas x Carrinhos" value={costCarts} isLoading={isLoadingAnalytics} />
        </div>
        <div className="row">
          <BudgetItem title="Vendas" tooltip="Nuvemshop" value={ordersToday.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Clicado em comprar" tooltip="Nuvemshop" value={ordersFiltered.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Taxa de aprovação" tooltip="Vendas x Clicado em comprar" value={passRate} isLoading={isLoadingOrders} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
