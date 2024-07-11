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
}

const DEFAULT_VALUE = '0';
const DEFAULT_PERCENTAGE = '0%';

export function DataSectionPay({ bgcolor }: DataSectionCartProps) {
  const { orders, isLoading: isLoadingOrders, date } = useOrders();
  const { paidOrders } = filterOrders(orders, date);
  const { ordersFiltered } = useFilterAllOrders(orders, date);
  const [passRate, setPassRate] = useState(DEFAULT_PERCENTAGE);
  const [creditCardTransactions, setCreditCardTransactions] = useState(DEFAULT_VALUE);
  const [pixTransactions, setPixTransactions] = useState(DEFAULT_VALUE);
  const [boletoTransactions, setBoletoTransactions] = useState(DEFAULT_VALUE);
  const [creditCardPercentage, setCreditCardPercentage] = useState(DEFAULT_PERCENTAGE);
  const [pixPercentage, setPixPercentage] = useState(DEFAULT_PERCENTAGE);
  const [boletoPercentage, setBoletoPercentage] = useState(DEFAULT_PERCENTAGE);

  useEffect(() => {
    if (ordersFiltered.length > 0) {
      const passRateValue = (paidOrders.length / ordersFiltered.length) * 100;
      setPassRate(passRateValue.toFixed(1) + '%');
    }
  }, [orders, ordersFiltered, paidOrders.length]); 

  useEffect(() => {
    const creditCardCount = paidOrders.filter(order => order.data.payment_details.method === 'credit_card').length;
    const pixCount = paidOrders.filter(order => order.data.payment_details.method === 'pix').length;
    const boletoCount = paidOrders.filter(order => order.data.payment_details.method === 'boleto').length;
    const totalPaidOrders = paidOrders.length;

    setCreditCardTransactions(creditCardCount.toString());
    setPixTransactions(pixCount.toString());
    setBoletoTransactions(boletoCount.toString());

    setCreditCardPercentage(((creditCardCount / totalPaidOrders) * 100).toFixed(0) + '%');
    setPixPercentage(((pixCount / totalPaidOrders) * 100).toFixed(0) + '%');
    setBoletoPercentage(((boletoCount / totalPaidOrders) * 100).toFixed(0) + '%');
  }, [paidOrders]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Pagamento</h4>
        <div className="row">
          <BudgetItem title="Vendas" tooltip="Nuvemshop" value={paidOrders.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Clicado em comprar" tooltip="Nuvemshop" value={ordersFiltered.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Taxa de aprovação" tooltip="Vendas x Clicado em comprar" value={passRate} isLoading={isLoadingOrders} />
        </div>
        <div className="row">
          <BudgetItem title="Transações no Cartão" tooltip="Vendas por cartão" value={creditCardPercentage} isLoading={isLoadingOrders} small={creditCardTransactions} />
          <BudgetItem title="Transações no Pix" tooltip="Vendas por pix" value={pixPercentage} isLoading={isLoadingOrders} small={pixTransactions}/>
          <BudgetItem title="Transações no Boleto" tooltip="Vendas por boleto" value={boletoPercentage} isLoading={isLoadingOrders} small={boletoTransactions}/>
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
