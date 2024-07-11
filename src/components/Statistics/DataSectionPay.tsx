import React, { useEffect, useState } from "react";
import { BudgetItem } from "./BudgetItem";
import { ContainerOrders, ContainerGeral } from './styles';
import { useOrders } from "../../context/OrdersContext";
import { filterOrders } from "../../tools/filterOrders";
import { FaCreditCard, FaPix } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface DataSectionCartProps {
  bgcolor: string;
}

const DEFAULT_VALUE = '0';
const DEFAULT_PERCENTAGE = '0%';

export function DataSectionPay({ bgcolor }: DataSectionCartProps) {
  const { orders, isLoading: isLoadingOrders, date } = useOrders();
  const { paidOrders, ordersAllToday } = filterOrders(orders, date);
  const [ passRate, setPassRate ] = useState(DEFAULT_PERCENTAGE);
  const [ creditCardTransactions, setCreditCardTransactions ] = useState(DEFAULT_VALUE);
  const [ pixTransactions, setPixTransactions ] = useState(DEFAULT_VALUE);
  const [ boletoTransactions, setBoletoTransactions ] = useState(DEFAULT_VALUE);
  const [ creditCardPercentage, setCreditCardPercentage ] = useState(DEFAULT_PERCENTAGE);
  const [ pixPercentage, setPixPercentage ] = useState(DEFAULT_PERCENTAGE);
  const [ boletoPercentage, setBoletoPercentage ] = useState(DEFAULT_PERCENTAGE);

  const [ creditCardApprovalRate, setCreditCardApprovalRate ] = useState(DEFAULT_PERCENTAGE);
  const [ pixApprovalRate, setPixApprovalRate ] = useState(DEFAULT_PERCENTAGE);
  const [ boletoApprovalRate, setBoletoApprovalRate ] = useState(DEFAULT_PERCENTAGE);

  const colorCard = '#66bb6a'
  const colorPix = '#42a5f5'
  const colorBoleto = '#ffb74d'

  useEffect(() => {
    if (ordersAllToday.length > 0) {
      const passRateValue = (paidOrders.length / ordersAllToday.length) * 100;
      setPassRate(passRateValue.toFixed(1) + '%');
    }
  }, [orders, ordersAllToday, paidOrders.length]); 

  useEffect(() => {
    const creditCardCount = ordersAllToday.filter(order => order.data.payment_details.method === 'credit_card').length;
    const paidCreditCardCount = ordersAllToday.filter(order => order.data.payment_details.method === 'credit_card' && order.status === 'paid').length;

    const pixCount = ordersAllToday.filter(order => order.data.payment_details.method === 'pix').length;
    const paidPixCount = ordersAllToday.filter(order => order.data.payment_details.method === 'pix' && order.status === 'paid').length;

    const boletoCount = ordersAllToday.filter(order => order.data.payment_details.method === 'boleto').length;
    const paidBoletoCount = ordersAllToday.filter(order => order.data.payment_details.method === 'boleto' && order.status === 'paid').length;

    const totalOrdersToday = ordersAllToday.length;

    setCreditCardTransactions(creditCardCount.toString());
    setPixTransactions(pixCount.toString());
    setBoletoTransactions(boletoCount.toString());

    setCreditCardPercentage(((creditCardCount / totalOrdersToday) * 100).toFixed(0) + '%');
    setPixPercentage(((pixCount / totalOrdersToday) * 100).toFixed(0) + '%');
    setBoletoPercentage(((boletoCount / totalOrdersToday) * 100).toFixed(0) + '%');

    setCreditCardApprovalRate(((paidCreditCardCount / creditCardCount) * 100).toFixed(1) + '%');
    setPixApprovalRate(((paidPixCount / pixCount) * 100).toFixed(1) + '%');
    setBoletoApprovalRate(((paidBoletoCount / boletoCount) * 100).toFixed(1) + '%');
  }, [paidOrders, ordersAllToday]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Pagamento</h4>
        <div className="row">
          <BudgetItem title="Pago" tooltip="Nuvemshop" value={paidOrders.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Clicado em comprar" tooltip="Nuvemshop" value={ordersAllToday.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Taxa de aprovação Geral" tooltip="Vendas x Clicado em comprar" value={passRate} isLoading={isLoadingOrders} />
        </div>
        <div className="row">
          <BudgetItem icon={FaCreditCard} iconColor={colorCard} title="Transações no Cartão" tooltip="Nuvemshop" value={creditCardTransactions} isLoading={isLoadingOrders} small={creditCardPercentage} />
          <BudgetItem icon={FaPix} iconColor={colorPix} title="Transações no Pix" tooltip="Nuvemshop" value={pixTransactions} isLoading={isLoadingOrders} small={pixPercentage} />
          <BudgetItem icon={FaFileInvoiceDollar} iconColor={colorBoleto} title="Transações no Boleto" tooltip="Nuvemshop" value={boletoTransactions} isLoading={isLoadingOrders} small={boletoPercentage} />
        </div>
        <div className="row">
          <BudgetItem icon={FaCreditCard} iconColor={colorCard} title="Taxa de Aprovação no Cartão" tooltip="Nuvemshop" value={creditCardApprovalRate} isLoading={isLoadingOrders} />
          <BudgetItem icon={FaPix} iconColor={colorPix} title="Taxa de Aprovação no Pix" tooltip="Nuvemshop" value={pixApprovalRate} isLoading={isLoadingOrders} />
          <BudgetItem icon={FaFileInvoiceDollar} iconColor={colorBoleto} title="Taxa de Aprovação no Boleto" tooltip="Nuvemshop" value={boletoApprovalRate} isLoading={isLoadingOrders} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
