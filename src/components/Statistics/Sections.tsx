import React, { useEffect, useMemo, useState } from "react";
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCoupons } from "../../context/CouponsContext";
import { useOrders } from "../../context/OrdersContext";
import { BudgetItem } from './BudgetItem';
import { calculateAverageTicket, formatCurrency, parseCurrency } from '../../tools/tools';
import { filterOrders } from "../../tools/filterOrders";
import { ContainerOrders, ContainerGeral } from './styles';
import { GrMoney } from 'react-icons/gr';
import { DiGoogleAnalytics } from 'react-icons/di';
import { FcGoogle } from 'react-icons/fc';
import { FaMeta } from 'react-icons/fa6';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { FaCreditCard, FaPix } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { CouponProps, DataSectionAnalyticsProps, DataSectionCartProps, DataSectionCostsProps, DataSectionPayProps, DataSectionTPagoProps, Order } from "../../types";

const DEFAULT_VALUE = '0';
const DEFAULT_PERCENTAGE = '0%';

export function DataSectionTPago({
  title,
  bgcolor,
  verbaGoogle,
  verbaMeta,
  totalAdSpend,
  totalOrdersFormatted,
  roas,
  roasMax,
  isLoadingADSGoogle,
  isLoadingOrders,
  isLoadingADSMeta,
}: DataSectionTPagoProps) {
  verbaGoogle = formatCurrency(verbaGoogle);
  verbaMeta = formatCurrency(verbaMeta);
  totalAdSpend = formatCurrency(totalAdSpend);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>
          {title}
        </h4>
        <div className='row'>
          <BudgetItem
            icon={FcGoogle}
            title='Verba Google'
            tooltip="Google ADS"
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            icon={FaMeta}
            iconColor='#008bff'
            title='Verba Meta'
            tooltip="Meta ADS"
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
          />
          <BudgetItem
            icon={GrMoney}
            iconColor='var(--geralblack-100)'
            title='Verba Total'
            tooltip="Google ADS x Meta ADS"
            value={totalAdSpend}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle}
          />
        </div>
        <div className='row'>
          <BudgetItem
            icon={MdOutlineAttachMoney}
            iconColor='var(--uipositive-100)'
            title='Faturamento'
            tooltip="Nuvemshop" 
            value={totalOrdersFormatted}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={DiGoogleAnalytics}
            iconColor='var(--geralblack-100)'
            title='ROAS'
            tooltip="Faturamento x Verba Total"
            value={roas}
            small={roasMax}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle || isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionPay({ bgcolor }: DataSectionPayProps) {
  const { allOrders, isLoading: isLoadingOrders, date } = useOrders();
  const { ordersTodayPaid, ordersAllToday } = filterOrders(allOrders, date);
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

  const colorCard = '#66bb6a';
  const colorPix = '#42a5f5';
  const colorBoleto = '#ffb74d';

  const calculatePercentage = (count: number, total: number): string => 
    total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';

  const calculateCount = (method: string, status: null | string = null): number => 
    ordersAllToday.filter(order => 
      order.payment_details.method === method && 
      (status ? order.payment_status === status : true)
    ).length;

  useEffect(() => {
    if (ordersAllToday.length > 0) {
      const passRateValue = (ordersTodayPaid.length / ordersAllToday.length) * 100;
      setPassRate(passRateValue.toFixed(1) + '%');
    }
  }, [allOrders, ordersAllToday, ordersTodayPaid.length]); 

  useEffect(() => {
    const creditCardCount = calculateCount('credit_card');
    const paidCreditCardCount = calculateCount('credit_card', 'paid');
    const pixCount = calculateCount('pix');
    const paidPixCount = calculateCount('pix', 'paid');
    const boletoCount = calculateCount('boleto');
    const paidBoletoCount = calculateCount('boleto', 'paid');
    const totalOrdersToday = ordersAllToday.length;

    setCreditCardTransactions(creditCardCount.toString());
    setPixTransactions(pixCount.toString());
    setBoletoTransactions(boletoCount.toString());
  
    setCreditCardPercentage(calculatePercentage(creditCardCount, totalOrdersToday));
    setPixPercentage(calculatePercentage(pixCount, totalOrdersToday));
    setBoletoPercentage(calculatePercentage(boletoCount, totalOrdersToday));

    setCreditCardApprovalRate(calculatePercentage(paidCreditCardCount, creditCardCount));
    setPixApprovalRate(calculatePercentage(paidPixCount, pixCount));
    setBoletoApprovalRate(calculatePercentage(paidBoletoCount, boletoCount));
  }, [ordersTodayPaid, ordersAllToday]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Pagamento</h4>
        <div className="row">
          <BudgetItem title="Pago" tooltip="Nuvemshop" value={ordersTodayPaid.length} isLoading={isLoadingOrders} />
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

export function DataSectionCosts({
  bgcolor,
  totalAdSpend,
  totalOrdersFormatted,
  isLoadingADSGoogle,
  isLoadingADSMeta,
}: DataSectionCostsProps) {
  totalAdSpend = formatCurrency(totalAdSpend);

  const { data } = useAnalytics();
  const { allOrders, isLoading: isLoadingOrders, date } = useOrders();
  const { ordersToday } = filterOrders(allOrders, date);
  const [productCost, setProductCost] = useState('R$ 0,00');
  const [grossProfit, setGrossProfit] = useState('R$ 0,00');
  const [grossMargin, setGrossMargin] = useState('0%');
  const [contributionMargin, setContributionMargin] = useState('0%');
  const [productCostPercent, setProductCostPercent] = useState('0%');
  const [totalProfit, setTotalProfit] = useState('R$ 0,00');

  useEffect(() => {
    if (ordersToday.length > 0) {
      const totalProductCost = ordersToday.reduce((totalOrderCost, order) => {
        const orderProductCost = order.products.reduce(
          (productTotal, product) => {
            const cost = product.cost ? parseFloat(product.cost) : 0; // Verifica se o custo não é null
            return productTotal + cost;
          },
          0,
        );
        return totalOrderCost + orderProductCost;
      }, 0);

      setProductCost(formatCurrency(totalProductCost));

      const totalOrderValue = parseCurrency(totalOrdersFormatted);
      const grossProfitValue = totalOrderValue - totalProductCost;

      setGrossProfit(formatCurrency(grossProfitValue));

      // Calcular a Margem Bruta
      const grossMarginValue =
        totalOrderValue > 0 ? (grossProfitValue / totalOrderValue) * 100 : 0;
      setGrossMargin(grossMarginValue.toFixed(2) + '%');

      // Calcular a Margem Contribuição
      const contributionMarginValue =
        ((grossProfitValue - parseCurrency(totalAdSpend)) / grossProfitValue) *
        100;
      setContributionMargin(
        formatCurrency(contributionMarginValue.toFixed(2) + '%'),
      );

      // Calcular a Margem Contribuição
      const productCostPercentValue =
        (totalProductCost / totalOrderValue) * 100;
      setProductCostPercent(productCostPercentValue.toFixed(2) + '%');

      // Calcular o Lucro Líquido
      const adSpend = parseCurrency(totalAdSpend);
      const totalProfitValue = totalOrderValue - totalProductCost - adSpend;
      setTotalProfit(formatCurrency(totalProfitValue));
    }
  }, [ordersToday, data]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Custos</h4>
        <div className='row'>
          <BudgetItem
            title='Lucro Bruto'
            tooltip='Faturamento - Custo de Produto'
            value={grossProfit}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo de Produto'
            tooltip='Nuvemshop'
            value={productCost}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo ADS'
            tooltip='Google ADS + Meta ADS'
            value={totalAdSpend}
            isLoading={isLoadingADSGoogle}
          />
        </div>
        <div className='row'>
          <BudgetItem
            title='Margem Bruta (%)'
            tooltip='Lucro Bruto / Faturamento'
            value={grossMargin}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo de Produto (%)'
            tooltip='Custo de Produto / Faturamento'
            value={productCostPercent}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Margem de Contribuição (%)'
            tooltip='Lucro Bruto - Custo ADS / Lucro Bruto'
            value={contributionMargin}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className='row'>
          <BudgetItem
            title='Lucro líquido'
            tooltip='Faturamento - Custo de Produto - Custo ADS'
            value={totalProfit}
            isLoading={isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionCart({ bgcolor, totalAdSpend }: DataSectionCartProps) {
  const { data, isLoadingADSGoogle } = useAnalytics();
  const { allOrders, date, isLoading, store } = useOrders();
  const { ordersToday } = filterOrders(allOrders, date);
  const { coupons } = useCoupons();
  const [ ordersWithCashback, setOrdersWithCashback ] = useState<Order[]>([]);
  const [ cartsRecoveryWhats, setCartsRecoveryWhats ] = useState<Order[]>([])
  const [ cartsRecoveryEmail, setCartsRecoveryEmail ] = useState<Order[]>([])
  const [ cartsRecoveryPopup, setCartsRecoveryPopup ] = useState<Order[]>([])
  const [ visits, setVisits ] = useState(DEFAULT_VALUE);
  const [ carts, setCarts ] = useState(DEFAULT_VALUE);
  const [ costCarts, setCostCart ] = useState(DEFAULT_VALUE);

  const couponsCashback = coupons.filter((coupon: CouponProps) => coupon.code.startsWith('MTZ'))
  const couponsWhats = ['WHATS10', 'WHATS15', 'WHATS20']
  const couponsEmail = ['OUTLET10', 'GANHEI10']
  const couponsPopup = store === 'outlet' ? ['GANHEI5'] : ['GANHEI10']

  useEffect(() => {
    const filteredOrdersCashBack = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => coupon.code.startsWith('MTZ'))
    );

    const filteredOrdersCartsWhats = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => couponsWhats.includes(coupon.code))
    );

    const filteredOrdersCartsEmail = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => couponsEmail.includes(coupon.code))
    );

    const filteredOrdersCartsPopup = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => couponsPopup.includes(coupon.code))
    );
    
    setOrdersWithCashback(filteredOrdersCashBack);
    setCartsRecoveryWhats(filteredOrdersCartsWhats);
    setCartsRecoveryEmail(filteredOrdersCartsEmail);
    setCartsRecoveryPopup(filteredOrdersCartsPopup);
  }, [date, allOrders]);

  useEffect(() => {
    if (data) {
      const { totalVisits, carts } = data;
      setVisits(parseInt(totalVisits).toLocaleString('pt-BR'));
      setCarts(parseInt(carts).toLocaleString('pt-BR'));
    }
  }, [data]);

  useEffect(() => {
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    if((totalAdSpend && numericCarts) !== 0){
      setCostCart(formatCurrency(totalAdSpend / numericCarts));
    }
  }, [carts, totalAdSpend]);

  const cartRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((numericCarts / numericVisits) * 100).toFixed(2) + '%'
      : '0.00';
  }, [carts, visits]);

  const popupRate = useMemo(() => {
    const numericOrders = ordersToday.length;
    const numericPopups = cartsRecoveryPopup.length;
    
    // Verifica se há pedidos antes de calcular a taxa
    return numericOrders > 0
      ? ((numericPopups / numericOrders) * 100).toFixed(2) + '%'
      : '0.00%';
  }, [ordersToday, cartsRecoveryPopup]);

  const totalCashbackSales = ordersWithCashback.length;
  const totalCashbackRevenue = ordersWithCashback.reduce((sum, order) => {
    return sum + parseFloat(order.total);
  }, 0);
  
  const totalCashbackValue = ordersWithCashback.reduce((sum, order) => {
    const coupon = order.coupon.find(c => c.code.startsWith('MTZ'));
    return sum + (coupon ? parseFloat(coupon.value) : 0);
  }, 0);

  const costCashback = totalCashbackValue > 0 ? formatCurrency(totalCashbackValue) : 'R$ 0,00';
  const roiCashback = totalCashbackValue > 0 ? (totalCashbackRevenue / totalCashbackValue).toFixed(2) : '0.00';

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Carrinho e Cashback</h4>
        <div className="row">
          <BudgetItem title="Carrinhos criados" tooltip="Google Analytics" value={carts} isLoading={isLoadingADSGoogle} />
          <BudgetItem title="Taxa de carrinho" tooltip="Carrinhos x Sessões" value={cartRate} isLoading={isLoadingADSGoogle} />
          <BudgetItem title="Custo de carrinho" tooltip="Vendas x Carrinhos" value={costCarts} isLoading={isLoadingADSGoogle} />
        </div>
        <div className="row">
          <BudgetItem icon={FaWhatsapp} iconColor={'var(--uipositive-100)'} title="Carrinhos recuperados" small={'Whatsapp'} tooltip={`Cupons: ${couponsWhats.join(', ')}`} value={cartsRecoveryWhats.length} isLoading={isLoading} />
          <BudgetItem icon={IoIosMail} iconColor={'var(--geralblack-100)'} title="Carrinhos recuperados" small={'Email'} tooltip={`Cupons: ${couponsEmail.join(', ')}`} value={cartsRecoveryEmail.length} isLoading={isLoading} />
        </div>
        <div className="row">
          <BudgetItem title="Cupom Popup" small={ordersToday.length} tooltip='Pedidos realizados com Cupom Popup' value={cartsRecoveryPopup.length} isLoading={isLoading} />
          <BudgetItem title="Taxa de Conversão de Popup" tooltip="Popup x Pedidos" value={popupRate} isLoading={isLoading} />        
        </div>
        <div className="row">
          <BudgetItem title="Vendas | Cashback" tooltip="Vendas com Cashback" value={totalCashbackSales} small={couponsCashback.length} isLoading={isLoading} />
          <BudgetItem title="Faturamento | Cashback" tooltip="Vendas com Cashback (R$)" value={formatCurrency(totalCashbackRevenue)} small={`ROI: ${roiCashback}`}  isLoading={isLoading} />
          <BudgetItem title="Custo | Cashback" tooltip="Custo com cashback" value={costCashback} isLoading={isLoading} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionAnalytics({ bgcolor, totalAdSpend }: DataSectionAnalyticsProps) {
  const { data, isLoadingADSGoogle: isLoadingAnalytics } = useAnalytics();
  const { allOrders, isLoading: isLoadingOrders, date } = useOrders();
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
          <BudgetItem title="Sessões" tooltip="Google Analytics" value={visits} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Vendas" tooltip="Nuvemshop (Geral)" value={ordersToday.length} isLoading={isLoadingOrders} />
          <BudgetItem title="Taxa de conversão" tooltip="Sessões x Vendas" value={conversionRate} isLoading={isLoadingOrders} />
        </div>
        <div className="row">
          <BudgetItem title="Ticket Médio" tooltip="Nuvemshop" value={averageTicket} isLoading={isLoadingOrders} />
          <BudgetItem title="Custo p/ Sessão (CPS)" tooltip="Verba Total / Sessões" value={priceSession} isLoading={isLoadingOrders} />
          <BudgetItem title="Custo p/ Aquisição (CPA)" tooltip="Verba Total / Vendas" value={priceAcquisition} isLoading={isLoadingOrders} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
