import React, { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCoupons } from '../../context/CouponsContext';
import { useOrders } from '../../context/OrdersContext';
import { BudgetItem, BudgetItemList } from './BudgetItem';
import {
  adjustDate,
  calculateAverageTicket,
  calculatePopupRate,
  calculateRoas,
  formatCurrency,
  generateDataCosts,
  generateRoasData,
  parseCurrency,
} from '../../tools/tools';
import { filterOrders } from '../../tools/filterOrders';
import { ContainerOrders, ContainerGeral } from './styles';
import { GrMoney } from 'react-icons/gr';
import { DiGoogleAnalytics } from 'react-icons/di';
import { FcGoogle } from 'react-icons/fc';
import { FaHandshakeSimple, FaMeta, FaPeopleGroup } from 'react-icons/fa6';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { FaCreditCard, FaPix } from 'react-icons/fa6';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { RiMessengerLine } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa6';

import {
  CouponProps,
  DataSectionAnalyticsProps,
  DataSectionCartProps,
  DataSectionCostsProps,
  DataSectionPayProps,
  DataSectionTPagoProps,
  DataSectionTPagoAPProps,
  PlanilhaAnalyticsProps,
  Order,
  Coupon,
} from '../../types';
import { useRefunds } from '../../context/RefundsContext';
import { TooltipInfo } from '../TooltipInfo';
import { RefundPopup } from '../Refunds/RefundsPopup';
import { IoIosMail } from 'react-icons/io';
import { useTikTokAds } from '../../context/TikTokAdsContext';
import { FaTiktok } from 'react-icons/fa';

const DEFAULT_VALUE = '0';
const DEFAULT_PERCENTAGE = '0%';

export function DataSectionTPago({
  title,
  bgcolor,
  verba,
  totalOrdersFormatted,
  roas,
  roasMax,
  isLoadingADSGoogle,
  isLoadingOrders,
  isLoadingADSMeta,
  roasEspelhos,
  roasQuadros,
}: DataSectionTPagoProps) {
  const { allOrders, date, store } = useOrders();
  const { adsData, loading, error, fetchTikTokAds, totalCostTikTokAll } =
    useTikTokAds();
  const { fetchDataGoogle, fetchDataADSMeta, errorMeta, errorGoogle } =
    useAnalytics();
  // Filtros para pedidos
  const {
    totalEspelhosFormatted,
    totalQuadrosFormatted,
    totalPaidAllAmountEcom,
    totalPaidAmountChatbot,
    totalRevenue,
  } = filterOrders(allOrders, date);
  const verbaGoogleSum =
    verba.googleEcom +
    verba.googleEspelhos +
    verba.googleGeral +
    verba.googleQuadros +
    verba.googleLoja;
  const verbaMetaSum =
    verba.metaEcom +
    verba.metaEspelhos +
    verba.metaGeral +
    verba.metaQuadros +
    verba.metaChatbot +
    verba.metaInstagram;

  const verbaGoogle = formatCurrency(verbaGoogleSum);
  const verbaMeta = formatCurrency(verbaMetaSum);
  const totalAdSpend = formatCurrency(verbaGoogleSum + verbaMetaSum);

  // Função para converter o objeto em arrays separados por plataforma
  const formatCostsByPlatform = (
    costs: Record<string, number>,
    platform: string,
  ) => {
    const filteredCosts = Object.entries(costs)
      .filter(
        ([key, value]) =>
          key.toLowerCase().includes(platform.toLowerCase()) &&
          key !== platform &&
          value !== 0,
      ) // Filtra por plataforma
      .map(([key, value]) => ({
        name: key.replace(platform, ''), // Remove o nome da plataforma
        value, // Formata para BRL
      }));

    return filteredCosts;
  };

  const sumCostsByCombinedPlatform = (costs: Record<string, number>) => {
    const platformTotals: Record<string, number> = {};

    Object.entries(costs).forEach(([key, value]) => {
      // Extraímos a parte comum da chave (ex: "Quadros", "Espelhos", etc.)
      const platformType = key.replace(/^(google|meta)/i, '').toLowerCase();

      if (typeof value === 'number') {
        // Soma os valores da mesma categoria, independentemente da plataforma (google/meta)
        platformTotals[platformType] =
          (platformTotals[platformType] || 0) + value;
      }
    });

    // Converte o objeto em um array de objetos, formatando as categorias
    return Object.entries(platformTotals)
      .filter(
        ([name, value]) =>
          value !== 0 && name !== 'google' && name !== 'meta' && name !== '',
      )
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitaliza o nome da plataforma
        value, // Formata o total com duas casas decimais
      }));
  };

  const googleCosts = formatCostsByPlatform(verba, 'google');
  const metaCosts = formatCostsByPlatform(verba, 'meta');

  let totalCosts = [{ name: '', value: 0 }];
  totalCosts = sumCostsByCombinedPlatform(verba);
  
  /*
  if (store === 'outlet') {
    totalCosts = sumCostsByCombinedPlatform(verba);
    // Atualiza o valor de "Geral" com o valor de "all" do TikTok ADS
    if (totalCostTikTokAll !== null) {
      totalCosts = totalCosts.map((item) => {
        if (item.name === 'Geral') {
          return {
            ...item,
            value: item.value + totalCostTikTokAll, // Soma o valor de "all" ao valor de "Geral"
          };
        }
        return item;
      });
    }
  }
  if (store === 'artepropria') {
    totalCosts = sumCostsByCombinedPlatform(verba);
  }*/

  const totalByCategory =
    store === 'outlet'
      ? [
          {
            name: 'Quadros',
            value: totalQuadrosFormatted,
          },
          { name: 'Espelhos', value: totalEspelhosFormatted },
        ]
      : [
          {
            name: 'Ecom',
            value: totalPaidAllAmountEcom,
          },
          { name: 'Chatbot', value: totalPaidAmountChatbot },
          { name: 'Loja Física', value: totalRevenue },
        ];
  const totalByCategoryOT = [
    {
      name: 'Quadros',
      value: roasQuadros,
    },
    { name: 'Espelhos', value: roasEspelhos },
  ];
  const tiktokCostAll = [
    {
      name: 'Geral',
      value: totalCostTikTokAll, // Valor de "all"
    },
  ];
  const handleUpdateDataADS = () => {
    fetchDataGoogle();
    fetchDataADSMeta();
    fetchTikTokAds();
  };

  const dataRoas = generateRoasData(totalByCategory, totalCosts);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Tráfego Pago | {title}</h4>
        <div className="row">
          <BudgetItemList
            icon={FcGoogle}
            title="Verba Google"
            dataCosts={googleCosts}
            tooltip="Google ADS"
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
            handleAction={fetchDataGoogle}
            error={errorGoogle}
          />
          <BudgetItemList
            icon={FaMeta}
            iconColor="#008bff"
            title="Verba Meta"
            dataCosts={metaCosts}
            tooltip="Meta ADS"
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
            handleAction={fetchDataADSMeta}
            error={errorMeta}
          />

          <BudgetItemList
            icon={GrMoney}
            iconColor="var(--geralblack-100)"
            title="Verba Total"
            dataCosts={totalCosts}
            tooltip="Google ADS x Meta ADS"
            value={totalAdSpend}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle}
            handleAction={handleUpdateDataADS}
          />
        </div>
        <div className="row">
          <BudgetItemList
            icon={MdOutlineAttachMoney}
            iconColor="var(--uipositive-100)"
            title="Faturamento"
            info="Frete incluído"
            dataCosts={totalByCategory}
            tooltip="Nuvemshop"
            value={totalOrdersFormatted}
            isLoading={isLoadingOrders}
          />
          <BudgetItemList
            icon={DiGoogleAnalytics}
            iconColor="var(--geralblack-100)"
            title="ROAS"
            tooltip="Faturamento x Verba Total"
            dataCosts={totalByCategoryOT}
            value={roas}
            small={title !== 'Chatbot' ? roasMax : undefined}
            isLoading={
              isLoadingADSMeta || isLoadingADSGoogle || isLoadingOrders
            }
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionTPagoAP({
  title,
  bgcolor,
  verba,
  totalOrdersFormatted,
  roas,
  roasEcom,
  roasLoja,
  roasChatbot,
  roasMax,
  isLoadingADSGoogle,
  isLoadingOrders,
  isLoadingADSMeta,
}: DataSectionTPagoAPProps) {
  const { allOrders, date, store } = useOrders();
  const { fetchDataGoogle, fetchDataADSMeta, errorMeta, errorGoogle } =
    useAnalytics();
  // Filtros para pedidos
  const {
    totalEspelhosFormatted,
    totalQuadrosFormatted,
    totalPaidAllAmountEcom,
    totalPaidAmountChatbot,
    totalRevenue,
  } = filterOrders(allOrders, date);
  const verbaGoogleSum =
    verba.googleEcom +
    verba.googleEspelhos +
    verba.googleGeral +
    verba.googleQuadros +
    verba.googleLoja;
  const verbaMetaSum =
    verba.metaEcom +
    verba.metaEspelhos +
    verba.metaGeral +
    verba.metaQuadros +
    verba.metaChatbot +
    verba.metaInstagram;

  const verbaGoogle = formatCurrency(verbaGoogleSum);
  const verbaMeta = formatCurrency(verbaMetaSum);
  const totalAdSpend = formatCurrency(verbaGoogleSum + verbaMetaSum);

  // Função para converter o objeto em arrays separados por plataforma
  const formatCostsByPlatform = (
    costs: Record<string, number>,
    platform: string,
  ) => {
    const filteredCosts = Object.entries(costs)
      .filter(
        ([key, value]) =>
          key.toLowerCase().includes(platform.toLowerCase()) &&
          key !== platform &&
          value !== 0,
      ) // Filtra por plataforma
      .map(([key, value]) => ({
        name: key.replace(platform, ''), // Remove o nome da plataforma
        value, // Formata para BRL
      }));

    return filteredCosts;
  };

  const sumCostsByCombinedPlatform = (costs: Record<string, number>) => {
    const platformTotals: Record<string, number> = {};

    Object.entries(costs).forEach(([key, value]) => {
      // Extraímos a parte comum da chave (ex: "Quadros", "Espelhos", etc.)
      const platformType = key.replace(/^(google|meta)/i, '').toLowerCase();

      if (typeof value === 'number') {
        // Soma os valores da mesma categoria, independentemente da plataforma (google/meta)
        platformTotals[platformType] =
          (platformTotals[platformType] || 0) + value;
      }
    });

    // Converte o objeto em um array de objetos, formatando as categorias
    return Object.entries(platformTotals)
      .filter(
        ([name, value]) =>
          value !== 0 && name !== 'google' && name !== 'meta' && name !== '',
      )
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitaliza o nome da plataforma
        value, // Formata o total com duas casas decimais
      }));
  };

  const googleCosts = formatCostsByPlatform(verba, 'google');
  const metaCosts = formatCostsByPlatform(verba, 'meta');
  let totalCosts = [{ name: '', value: 0 }];
  totalCosts = sumCostsByCombinedPlatform(verba);

  const handleUpdateDataADS = () => {
    fetchDataGoogle();
    fetchDataADSMeta();
  };

  // Filtros para pedidos

  const totalByCategory = [
    {
      name: 'Ecom',
      value: totalPaidAllAmountEcom,
    },
    { name: 'Chatbot', value: totalPaidAmountChatbot },
    { name: 'Loja Física', value: totalRevenue },
  ];

  const totalByCategoryAP = [
    {
      name: 'Ecom',
      value: roasEcom,
    },
    { name: 'Chatbot', value: roasChatbot },
    { name: 'Loja Física', value: roasLoja },
  ];

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Tráfego Pago | {title}</h4>
        <div className="row">
          <BudgetItemList
            icon={FcGoogle}
            title="Verba Google"
            dataCosts={googleCosts}
            tooltip="Google ADS"
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
            handleAction={fetchDataGoogle}
            error={errorGoogle}
          />
          <BudgetItemList
            icon={FaMeta}
            iconColor="#008bff"
            title="Verba Meta"
            dataCosts={metaCosts}
            tooltip="Meta ADS"
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
            handleAction={fetchDataADSMeta}
            error={errorMeta}
          />
          <BudgetItemList
            icon={GrMoney}
            iconColor="var(--geralblack-100)"
            title="Verba Total"
            dataCosts={totalCosts}
            tooltip="Google ADS x Meta ADS"
            value={totalAdSpend}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle}
            handleAction={handleUpdateDataADS}
          />
        </div>
        <div className="row">
          <BudgetItemList
            icon={MdOutlineAttachMoney}
            iconColor="var(--uipositive-100)"
            title="Faturamento"
            info="Frete incluído"
            dataCosts={totalByCategory}
            tooltip="Nuvemshop"
            value={totalOrdersFormatted}
            isLoading={isLoadingOrders}
          />
          <BudgetItemList
            icon={DiGoogleAnalytics}
            iconColor="var(--geralblack-100)"
            title="ROAS"
            tooltip="Faturamento x Verba Total"
            value={roas}
            dataCosts={totalByCategoryAP}
            small={title !== 'Chatbot' ? roasMax : undefined}
            isLoading={
              isLoadingADSMeta || isLoadingADSGoogle || isLoadingOrders
            }
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionPay({ bgcolor }: DataSectionPayProps) {
  const { allOrders, isLoading: isLoadingOrders, date } = useOrders();
  const { ordersTodayPaid, ordersAllToday } = filterOrders(allOrders, date);
  const [passRate, setPassRate] = useState(DEFAULT_PERCENTAGE);
  const [creditCardTransactions, setCreditCardTransactions] = useState<Order[]>(
    [],
  );
  const [pixTransactions, setPixTransactions] = useState<Order[]>([]);
  const [boletoTransactions, setBoletoTransactions] = useState<Order[]>([]);
  const [creditCardPercentage, setCreditCardPercentage] =
    useState(DEFAULT_PERCENTAGE);
  const [pixPercentage, setPixPercentage] = useState(DEFAULT_PERCENTAGE);
  const [boletoPercentage, setBoletoPercentage] = useState(DEFAULT_PERCENTAGE);

  const [creditCardApprovalRate, setCreditCardApprovalRate] =
    useState(DEFAULT_PERCENTAGE);
  const [pixApprovalRate, setPixApprovalRate] = useState(DEFAULT_PERCENTAGE);
  const [boletoApprovalRate, setBoletoApprovalRate] =
    useState(DEFAULT_PERCENTAGE);

  const colorCard = '#66bb6a';
  const colorPix = '#42a5f5';
  const colorBoleto = '#ffb74d';

  const calculatePercentage = (orders: Order[], total: number): string =>
    total > 0 ? ((orders.length / total) * 100).toFixed(1) + '%' : '0%';

  const filterTransactions = (method: string, status: null | string = null) =>
    ordersAllToday.filter(
      (order) =>
        order.payment_details.method === method &&
        (status ? order.payment_status === status : true),
    );

  useEffect(() => {
    if (ordersAllToday.length > 0) {
      const passRateValue =
        (ordersTodayPaid.length / ordersAllToday.length) * 100;
      setPassRate(passRateValue.toFixed(1) + '%');
    }
  }, []);

  useEffect(() => {
    const creditCardFilter = filterTransactions('credit_card');
    const paidCreditCardFilter = filterTransactions('credit_card', 'paid');
    const pixFilter = filterTransactions('pix');
    const paidPixFilter = filterTransactions('pix', 'paid');
    const boletoFilter = filterTransactions('boleto');
    const paidBoletoFilter = filterTransactions('boleto', 'paid');
    const totalOrdersToday = ordersAllToday.length;

    setCreditCardTransactions(creditCardFilter);
    setPixTransactions(pixFilter);
    setBoletoTransactions(boletoFilter);

    setCreditCardPercentage(
      calculatePercentage(creditCardFilter, totalOrdersToday),
    );
    setPixPercentage(calculatePercentage(pixFilter, totalOrdersToday));
    setBoletoPercentage(calculatePercentage(boletoFilter, totalOrdersToday));

    setCreditCardApprovalRate(
      calculatePercentage(paidCreditCardFilter, creditCardFilter.length),
    );
    setPixApprovalRate(calculatePercentage(paidPixFilter, pixFilter.length));
    setBoletoApprovalRate(
      calculatePercentage(paidBoletoFilter, boletoFilter.length),
    );
  }, [allOrders]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Pagamento</h4>
        <div className="row">
          <BudgetItem
            title="Pago"
            tooltip="Nuvemshop"
            value={ordersTodayPaid.length}
            isLoading={isLoadingOrders}
            orders={ordersTodayPaid}
          />
          <BudgetItem
            title="Clicado em comprar"
            tooltip="Nuvemshop"
            value={ordersAllToday.length}
            isLoading={isLoadingOrders}
            orders={ordersAllToday}
          />
          <BudgetItem
            title="Taxa de aprovação Geral"
            tooltip="Vendas x Clicado em comprar"
            value={passRate}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className="row">
          <BudgetItem
            icon={FaCreditCard}
            iconColor={colorCard}
            title="Transações no Cartão"
            tooltip="Nuvemshop"
            value={creditCardTransactions.length}
            isLoading={isLoadingOrders}
            small={creditCardPercentage}
            orders={creditCardTransactions}
          />
          <BudgetItem
            icon={FaPix}
            iconColor={colorPix}
            title="Transações no Pix"
            tooltip="Nuvemshop"
            value={pixTransactions.length}
            isLoading={isLoadingOrders}
            small={pixPercentage}
            orders={pixTransactions}
          />
          <BudgetItem
            icon={FaFileInvoiceDollar}
            iconColor={colorBoleto}
            title="Transações no Boleto"
            tooltip="Nuvemshop"
            value={boletoTransactions.length}
            isLoading={isLoadingOrders}
            small={boletoPercentage}
            orders={boletoTransactions}
          />
        </div>
        <div className="row">
          <BudgetItem
            icon={FaCreditCard}
            iconColor={colorCard}
            title="Taxa de Aprovação no Cartão"
            tooltip="Nuvemshop"
            value={creditCardApprovalRate}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={FaPix}
            iconColor={colorPix}
            title="Taxa de Aprovação no Pix"
            tooltip="Nuvemshop"
            value={pixApprovalRate}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={FaFileInvoiceDollar}
            iconColor={colorBoleto}
            title="Taxa de Aprovação no Boleto"
            tooltip="Nuvemshop"
            value={boletoApprovalRate}
            isLoading={isLoadingOrders}
          />
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
        <div className="row">
          <BudgetItem
            title="Lucro Bruto"
            tooltip="Faturamento - Custo de Produto"
            value={grossProfit}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title="Custo de Produto"
            tooltip="Nuvemshop"
            value={productCost}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title="Custo ADS"
            tooltip="Google ADS + Meta ADS"
            value={totalAdSpend}
            isLoading={isLoadingADSGoogle}
          />
        </div>
        <div className="row">
          <BudgetItem
            title="Margem Bruta (%)"
            tooltip="Lucro Bruto / Faturamento"
            value={grossMargin}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title="Custo de Produto (%)"
            tooltip="Custo de Produto / Faturamento"
            value={productCostPercent}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title="Margem de Contribuição (%)"
            tooltip="Lucro Bruto - Custo ADS / Lucro Bruto"
            value={contributionMargin}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className="row">
          <BudgetItem
            title="Lucro líquido"
            tooltip="Faturamento - Custo de Produto - Custo ADS"
            value={totalProfit}
            isLoading={isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionCart({
  bgcolor,
  totalAdSpend,
}: DataSectionCartProps) {
  const { data, isLoadingADSGoogle } = useAnalytics();
  const { allOrders, date, isLoading, store } = useOrders();
  const { ordersToday } = filterOrders(allOrders, date);
  const { coupons } = useCoupons();
  const [ordersWithCashback, setOrdersWithCashback] = useState<Order[]>([]);
  const [ordersSellers, setOrdersSellers] = useState<Order[]>([]);
  const [cartsRecoveryPartners, setCartsRecoveryPartners] = useState<Order[]>(
    [],
  );
  const [cartsRecoveryInsta, setCartsRecoveryInsta] = useState<Order[]>([]);
  const [cartsRecoveryInstaDirect, setCartsRecoveryInstaDirect] = useState<
    Order[]
  >([]);
  const [cartsRecoveryWhats, setCartsRecoveryWhats] = useState<Order[]>([]);
  const [cartsRecoveryEmail, setCartsRecoveryEmail] = useState<Order[]>([]);
  const [cartsRecoveryPopup, setCartsRecoveryPopup] = useState<Order[]>([]);
  const [visits, setVisits] = useState(DEFAULT_VALUE);
  const [carts, setCarts] = useState(DEFAULT_VALUE);
  const [costCarts, setCostCart] = useState(DEFAULT_VALUE);

  const couponsPartners = [
    'ALEXIA',
    'BAIXINHO',
    'BELISARIO10',
    'BRUNA15',
    'DAMIAO15',
    'DANI15',
    'FRAZAO15',
    'ISA10',
    'JOAOHANBIKE',
    'JUJUFRANCO',
    'LARISSAM10',
    'LEPANAR',
    'MARI15',
    'MATHEUSF10',
    'MEL15',
    'NOSSAAMORA10',
    'ORLANDO15',
    'TATI15',
    'TECAESTT15',
    'THAINATANI15',
    'GABICOSTA',
  ];

  const couponsSellers = [
    'CIBELEAP',
    'CLAUDIOAP',
    'DIEGOAP',
    'IAGOAP',
    'YARAAP',
  ];
  const couponsInsta = ['INSTA10', 'INSTA20', 'VIP10'];
  const couponsWhats = ['WHATS10', 'WHATS15', 'WHATS20'];
  const couponsEmail =
    store === 'outlet' ? ['OUTLET10', 'GANHEI10'] : ['GANHEI10'];
  const couponsPopup =
    store === 'outlet' ? ['GANHEI5', 'FRETEGRATIS'] : ['GANHEI10', 'GANHEI5'];

  const couponsCashback = coupons.filter((coupon: CouponProps) =>
    coupon.code.startsWith('MTZ'),
  );

  useEffect(() => {
    // Função genérica para filtrar e calcular o total dos pedidos
    const filterAndCalculateTotal = (filterCondition) => {
      const filteredOrders = ordersToday.filter((order: Order) =>
        filterCondition(order),
      );
      return { filteredOrders };
    };

    const cashbackCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => coupon.code.startsWith('MTZ'));

    const partnersCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => couponsPartners.includes(coupon.code));

    const sellersCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => couponsSellers.includes(coupon.code));

    const whatsCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => couponsWhats.includes(coupon.code));

    const instaCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => couponsInsta.includes(coupon.code));

    const instaDirectCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => coupon.code.endsWith('-10'));

    const emailCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => couponsEmail.includes(coupon.code));

    const popupCondition = (order: Order) =>
      order.coupon &&
      order.coupon.some((coupon) => couponsPopup.includes(coupon.code));

    // Cria um objeto que armazena os pedidos e seus totais
    const ordersFiltered = {
      cashBack: filterAndCalculateTotal(cashbackCondition),
      cartsPartners: filterAndCalculateTotal(partnersCondition),
      cartsSellers: filterAndCalculateTotal(sellersCondition),
      cartsWhats: filterAndCalculateTotal(whatsCondition),
      cartsInsta: filterAndCalculateTotal(instaCondition),
      cartsInstaDirect: filterAndCalculateTotal(instaDirectCondition),
      cartsEmail: filterAndCalculateTotal(emailCondition),
      cartsPopup: filterAndCalculateTotal(popupCondition),
    };

    // Atualiza os estados dos pedidos filtrados e dos totais
    setCartsRecoveryPartners(ordersFiltered.cartsPartners.filteredOrders);
    setOrdersSellers(ordersFiltered.cartsSellers.filteredOrders);
    setOrdersWithCashback(ordersFiltered.cashBack.filteredOrders);
    setCartsRecoveryWhats(ordersFiltered.cartsWhats.filteredOrders);
    setCartsRecoveryInsta(ordersFiltered.cartsInsta.filteredOrders);
    setCartsRecoveryInstaDirect(ordersFiltered.cartsInstaDirect.filteredOrders);
    setCartsRecoveryEmail(ordersFiltered.cartsEmail.filteredOrders);
    setCartsRecoveryPopup(ordersFiltered.cartsPopup.filteredOrders);
  }, [date, allOrders]);

  useEffect(() => {
    if (data) {
      const { totalVisits, carts } = data;
      setVisits(totalVisits.toLocaleString('pt-BR'));
      setCarts(carts.toLocaleString('pt-BR'));
    }
  }, [data]);

  useEffect(() => {
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    if ((totalAdSpend && numericCarts) !== 0) {
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

  const rateCouponWhats = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryWhats),
    [ordersToday, cartsRecoveryWhats],
  );

  const rateCouponEmail = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryEmail),
    [ordersToday, cartsRecoveryEmail],
  );

  const rateCouponPartners = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryPartners),
    [ordersToday, cartsRecoveryPartners],
  );

  const rateCouponSellers = useMemo(
    () => calculatePopupRate(ordersToday, ordersSellers),
    [ordersToday, ordersSellers],
  );

  const rateCouponPopup = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryPopup),
    [ordersToday, cartsRecoveryPopup],
  );

  const rateCouponInsta = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryInsta),
    [ordersToday, cartsRecoveryInsta],
  );

  const rateCouponInstaDirect = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryInstaDirect),
    [ordersToday, cartsRecoveryInstaDirect],
  );

  const totalCashbackSales = ordersWithCashback.length;
  const totalCashbackRevenue = ordersWithCashback.reduce((sum, order) => {
    return sum + parseFloat(order.total);
  }, 0);

  const totalCashbackValue = ordersWithCashback.reduce((sum, order) => {
    const coupon = order.coupon.find((c) => c.code.startsWith('MTZ'));
    return sum + (coupon ? parseFloat(coupon.value) : 0);
  }, 0);

  const costCashback =
    totalCashbackValue > 0 ? formatCurrency(totalCashbackValue) : 'R$ 0,00';
  const roiCashback =
    totalCashbackValue > 0
      ? (totalCashbackRevenue / totalCashbackValue).toFixed(2)
      : '0.00';

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Carrinho e Cupom</h4>
        <div className="row">
          <BudgetItem
            title="Carrinhos criados"
            tooltip="Google Analytics"
            value={carts}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            title="Taxa de carrinho"
            tooltip="Carrinhos x Sessões"
            value={cartRate}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            title="Custo de carrinho"
            tooltip="Vendas x Carrinhos"
            value={costCarts}
            isLoading={isLoadingADSGoogle}
          />
        </div>
        <div className="row">
          <BudgetItemList
            icon={FaWhatsapp}
            iconColor={'var(--uipositive-100)'}
            title="Cupom Whatsapp"
            small={rateCouponWhats}
            tooltip={`Cupons: ${couponsWhats.join(', ')}`}
            value={cartsRecoveryWhats.length}
            isLoading={isLoading}
            dataCosts={generateDataCosts(cartsRecoveryWhats, couponsWhats)}
            orders={cartsRecoveryWhats}
          />
          <BudgetItemList
            title="Cupom Instagram"
            icon={FaInstagram}
            iconColor={'#d6249f'}
            small={rateCouponInsta}
            tooltip={`Cupom: ${couponsInsta.join(', ')}`}
            value={cartsRecoveryInsta.length}
            isLoading={isLoading}
            dataCosts={generateDataCosts(cartsRecoveryInsta, couponsInsta)}
            orders={cartsRecoveryInsta}
          />
          {store === 'outlet' && (
            <>
              <BudgetItemList
                icon={RiMessengerLine}
                iconColor={'#fd5949'}
                small={rateCouponInstaDirect}
                title="Cupom Direct Instagram"
                tooltip={`Cupons enviados via Direct`}
                value={cartsRecoveryInstaDirect.length}
                isLoading={isLoading}
                dataCosts={[
                  {
                    name: 'Total',
                    value: cartsRecoveryInstaDirect.reduce(
                      (acc, order) => acc + parseInt(order.total),
                      0,
                    ),
                  },
                ]}
                orders={cartsRecoveryInstaDirect}
              />
              <BudgetItemList
                icon={FaHandshakeSimple}
                title="Cupom Parceria"
                small={rateCouponPartners}
                tooltip="Pedidos com cupom de parceria"
                value={cartsRecoveryPartners.length}
                isLoading={isLoading}
                dataCosts={[
                  {
                    name: 'Total',
                    value: cartsRecoveryPartners.reduce(
                      (acc, order) => acc + parseInt(order.total),
                      0,
                    ),
                  },
                ]}
                orders={cartsRecoveryPartners}
              />
              <BudgetItemList
                icon={IoIosMail}
                title="Cupom Email"
                small={rateCouponEmail}
                tooltip={`Cupons: ${couponsEmail.join(', ')}`}
                value={cartsRecoveryEmail.length}
                isLoading={isLoading}
                dataCosts={generateDataCosts(cartsRecoveryEmail, couponsEmail)}
                orders={cartsRecoveryEmail}
              />
            </>
          )}
          <BudgetItemList
            title="Cupom Popup"
            small={rateCouponPopup}
            tooltip="Pedidos realizados com cupom do Popup"
            value={cartsRecoveryPopup.length}
            isLoading={isLoading}
            dataCosts={[
              {
                name: 'Total',
                value: cartsRecoveryPopup.reduce(
                  (acc, order) => acc + parseInt(order.total),
                  0,
                ),
              },
            ]}
            orders={cartsRecoveryPopup}
          />
          {store === 'artepropria' && (
            <BudgetItemList
              icon={FaPeopleGroup}
              title="Cupom Vendedores"
              small={rateCouponSellers}
              tooltip="Pedidos realizados com cupom de vendedor"
              value={ordersSellers.length}
              isLoading={isLoading}
              dataCosts={generateDataCosts(ordersSellers, couponsSellers)}
              orders={ordersSellers}
            />
          )}
        </div>
        <div className="row">
          <BudgetItem
            title="Cupom Cashback"
            tooltip="Vendas com Cashback"
            value={totalCashbackSales}
            small={couponsCashback.length}
            isLoading={isLoading}
            orders={ordersWithCashback}
          />
          <BudgetItem
            title="Faturamento Cashback"
            tooltip="Vendas com Cashback (R$)"
            value={formatCurrency(totalCashbackRevenue)}
            small={`ROI: ${roiCashback}`}
            isLoading={isLoading}
          />
          <BudgetItem
            title="Custo Cashback"
            tooltip="Custo com cashback"
            value={costCashback}
            isLoading={isLoading}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionAnalytics({
  bgcolor,
  totalAdSpend,
}: DataSectionAnalyticsProps) {
  const { data, isLoadingADSGoogle: isLoadingAnalytics } = useAnalytics();
  const { allOrders, isLoading: isLoadingOrders, date, store } = useOrders();
  const { ordersToday } = filterOrders(allOrders, date);
  const [visits, setVisits] = useState('-');
  const [priceSession, setPriceSession] = useState('R$ -');
  const [priceAcquisition, setPriceAcquisition] = useState('R$ -');
  const [averageTicket, setAverageTicket] = useState('R$ -');

  useEffect(() => {
    setVisits(data.totalVisits.toLocaleString('pt-BR'));
  }, [data]);

  useEffect(() => {
    setPriceSession('R$ -');
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
  }, [date, ordersToday]);

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
          <BudgetItem
            title="Sessões"
            tooltip="Google Analytics"
            value={visits}
            isLoading={isLoadingAnalytics}
          />
          <BudgetItem
            title="Vendas"
            tooltip="Nuvemshop (Geral)"
            value={ordersToday.length}
            isLoading={isLoadingOrders}
            orders={ordersToday}
          />
          <BudgetItem
            title="Taxa de conversão"
            tooltip="Sessões x Vendas"
            value={conversionRate}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className="row">
          <BudgetItem
            title="Ticket Médio"
            tooltip="Nuvemshop"
            value={averageTicket}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title="Custo p/ Sessão (CPS)"
            tooltip="Verba Total / Sessões"
            value={priceSession}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title="Custo p/ Aquisição (CPA)"
            tooltip="Verba Total / Vendas"
            value={priceAcquisition}
            isLoading={isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionReembolso({ bgcolor }: { bgcolor: string }) {
  const { summary, loading, error } = useRefunds();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleIsOpenPopup = () => {
    setIsPopupOpen(true);
  };
  const handleIsClosePopup = () => {
    setIsPopupOpen(false);
  };
  if (loading) {
    return <p>Carregando reembolsos...</p>;
  }

  if (error) {
    return <p>Erro ao carregar reembolsos: {error}</p>;
  }

  return (
    <>
      <ContainerOrders>
        <ContainerGeral bgcolor={bgcolor}>
          <div className="title-box">
            <h4>Reembolsos</h4>
            <TooltipInfo
              className={`btn-plus ${error && 'error'}`}
              title={'Cadastrar Reembolsos'}
            >
              <FaPlus size={24} onClick={handleIsOpenPopup} />
            </TooltipInfo>
          </div>
          <div className="row">
            <BudgetItem
              title="Total Reembolsos"
              tooltip="Total de reembolsos feitos"
              value={summary.totalRefunds}
              isLoading={loading}
            />
            <BudgetItem
              title="Valor Total"
              tooltip="Valor total reembolsado"
              value={`R$ ${summary.totalValue.toFixed(2)}`}
              isLoading={loading}
            />
          </div>
          <div className="row">
            <BudgetItem
              title="Atraso"
              tooltip="Reembolsos por atraso"
              value={summary.categories.Atraso.count}
              small={`R$ ${summary.categories.Atraso.value.toFixed(2)}`}
              isLoading={loading}
            />
            <BudgetItem
              title="Não Gostou"
              tooltip="Reembolsos por insatisfação"
              value={summary.categories['Não gostou'].count}
              small={`R$ ${summary.categories['Não gostou'].value.toFixed(2)}`}
              isLoading={loading}
            />
            <BudgetItem
              title="Avaria"
              tooltip="Reembolsos por avaria"
              value={summary.categories.Avaria.count}
              small={`R$ ${summary.categories.Avaria.value.toFixed(2)}`}
              isLoading={loading}
            />
            <BudgetItem
              title="Outros"
              tooltip="Outros motivos de reembolso"
              value={summary.categories.Outros.count}
              small={`R$ ${summary.categories.Outros.value.toFixed(2)}`}
              isLoading={loading}
            />
          </div>
        </ContainerGeral>
      </ContainerOrders>
      <RefundPopup
        isPopupOpen={isPopupOpen}
        handleIsClosePopup={handleIsClosePopup}
      />
    </>
  );
}
/*
export const PlanilhaAnalytics: React.FC<PlanilhaAnalyticsProps> = ({
  bgcolor,
  ordersToday,
  isLoadingPlanilha,
}) => {
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Processa as métricas ao carregar os pedidos
  useEffect(() => {
    calculateMetrics(ordersToday);
  }, [ordersToday]);

  // Função para calcular as métricas
  const calculateMetrics = (orders: PlanilhaAnalyticsProps['ordersToday']) => {
    let revenue = 0;
    orders.forEach((order) => {
      // Considera apenas pedidos com "billing_name" === "Cliente Loja Física"
      if (order.billing_name !== 'Cliente Loja Física') {
        return;
      } else if (
        order.billing_name === 'Cliente Loja Física' &&
        order.contact_name !== 'Chatbot: Ranieri'
      ) {
        // Receita total (total): Soma os valores numéricos em "total"
        revenue += parseFloat(order.total) || 0;
      } else {
        return;
      }
    });
    setTotalRevenue(revenue);
  };

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Métricas de Pedidos</h4>

        <div className="row">
          <BudgetItem
            title="Receita Total:"
            tooltip=""
            value={totalRevenue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            isLoading={isLoadingPlanilha}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
};*/
