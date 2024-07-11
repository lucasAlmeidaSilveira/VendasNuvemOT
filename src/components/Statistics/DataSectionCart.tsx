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
  const { orders, isLoading: isLoadingOrders, date, customers, isLoadingCustomers } = useOrders();
  const { paidOrders } = filterOrders(orders, date);
  const { ordersFiltered } = useFilterAllOrders(orders, date);
  const [visits, setVisits] = useState(DEFAULT_VALUE);
  const [carts, setCarts] = useState(DEFAULT_VALUE);
  const [ beginCheckout, setBeginCheckout] = useState(DEFAULT_VALUE);
  const [passRate, setPassRate] = useState(DEFAULT_PERCENTAGE);
  const [costCarts, setCostCart] = useState(DEFAULT_VALUE);

  const [creditCardTransactions, setCreditCardTransactions] = useState(DEFAULT_VALUE);
  const [pixTransactions, setPixTransactions] = useState(DEFAULT_VALUE);
  const [boletoTransactions, setBoletoTransactions] = useState(DEFAULT_VALUE);

  const [creditCardPercentage, setCreditCardPercentage] = useState(DEFAULT_PERCENTAGE);
  const [pixPercentage, setPixPercentage] = useState(DEFAULT_PERCENTAGE);
  const [boletoPercentage, setBoletoPercentage] = useState(DEFAULT_PERCENTAGE);

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
    if((totalAdSpend && numericCarts) !== 0){
      setCostCart(formatCurrency(totalAdSpend / numericCarts));
    }
  }, [carts, totalAdSpend]); 

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

  const cartRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((numericCarts / numericVisits) * 100).toFixed(2) + '%'
      : '0.00';
  }, [carts, visits]);

  const popupConversionRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    const numericSignups = customers.length;
    return numericVisits > 0
      ? ((numericSignups / numericVisits) * 100).toFixed(2) + '%'
      : '0.00';
  }, [customers.length, visits]);

  const signupToPurchaseRate = useMemo(() => {
    const numericSignups = customers.length;
    return numericSignups > 0
      ? ((paidOrders.length / numericSignups) * 100).toFixed(2) + '%'
      : '0.00';
  }, [customers.length, paidOrders.length]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Carrinho e Popup</h4>
        <div className="row">
          <BudgetItem title="Carrinhos criados" tooltip="Google Analytics" value={carts} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Taxa de carrinho" tooltip="Carrinhos x Visitas" value={cartRate} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Custo de carrinho" tooltip="Vendas x Carrinhos" value={costCarts} isLoading={isLoadingAnalytics} />
        </div>
        <div className="row">
          <BudgetItem title="Inscrição Popup" tooltip="Nuvemshop" value={customers.length} isLoading={isLoadingCustomers} />
          <BudgetItem title="Taxa de Inscrição Popup" tooltip="Popup x Visitas" value={popupConversionRate} isLoading={isLoadingCustomers} />
          <BudgetItem title="Taxa de Inscrição com Compra" tooltip="Popup x Compras" value={signupToPurchaseRate} isLoading={isLoadingCustomers} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
