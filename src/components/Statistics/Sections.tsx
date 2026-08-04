import React, { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCoupons } from '../../context/CouponsContext';
import { useOrders } from '../../context/OrdersContext';
import { BudgetItem, BudgetItemList, BudgetItemListNumber } from './BudgetItem';
import {
  adjustDate,
  calculatePopupRate,
  calculateRoas,
  formatCurrency,
  generateDataCosts,
  generateRoasData,
  parseCurrency,
} from '../../tools/tools';
import {
  useStatisticsOrders,
  AdaptedOrder,
} from '../../hooks/useStatisticsOrders';
import { ContainerOrders, ContainerGeral, ContainerCharts } from './styles';
import { GrMoney } from 'react-icons/gr';
import { DiGoogleAnalytics } from 'react-icons/di';
import { FcGoogle } from 'react-icons/fc';
import {
  FaHandshakeSimple,
  FaMeta,
  FaPeopleGroup,
  FaCreditCard,
  FaPix,
  FaPlus,
} from 'react-icons/fa6';
import { MdOutlineAttachMoney, MdOutlineSell } from 'react-icons/md';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { RiMessengerLine } from 'react-icons/ri';
import { RiRobot2Line } from 'react-icons/ri';
import { SiHomeassistantcommunitystore } from 'react-icons/si';

import {
  CouponProps,
  CouponRow,
  DatabaseTable,
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
import { fetchTable } from '../../api/db';
import { formatDate } from '../../tools/tools';
import { useRefunds } from '../../context/RefundsContext';
import { TooltipInfo } from '../TooltipInfo';
import { RefundPopup } from '../Refunds/RefundsPopup';
import { IoIosMail } from 'react-icons/io';
import { useTikTokAds } from '../../context/TikTokAdsContext';
import { FaTiktok } from 'react-icons/fa';
import { RefundPopupReenvio } from '../Refunds/RefundPopupReenvio';
import { ChartLine } from '../Chart';

const DEFAULT_VALUE = '0';
const DEFAULT_PERCENTAGE = '0%';

export function DataSectionTPago({
  title,
  bgcolor,
  verba,
  totalOrdersFormatted,
  isLoadingADSGoogle,
  isLoadingOrders,
  isLoadingADSMeta,
}: DataSectionTPagoProps) {
  const { date, store } = useOrders();
  const {
    adsData,
    loading,
    error,
    fetchTikTokAds,
    fetchTikTokCreatives,
    allFullCreatives,
    totalCostTikTokAll,
  } = useTikTokAds();
  const { fetchDataGoogle, fetchDataADSMeta, errorMeta, errorGoogle } =
    useAnalytics();
  // Métricas de pedido agora vêm do orders_shop (base nova) via useStatisticsOrders,
  // que replica o filterOrders legado. Chatbot/Loja Física (storefront) = 0.
  const {
    totalEspelhos: totalEspelhosFormatted,
    totalQuadros: totalQuadrosFormatted,
    totalPaidAllAmountEcom,
    totalPaidAmountChatbot,
    totalRevenue,
    totalPaidAllAmountFormatted,
    totalRecorrentesClientesChatbot,
  } = useStatisticsOrders(store, date);
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

  // Verba Total (denominador comum do ROAS Geral e do Max.).
  const totalAdSpendValue = verbaGoogleSum + verbaMetaSum + totalCostTikTokAll;
  const totalAdSpend = formatCurrency(totalAdSpendValue);

  // ROAS = Faturamento / Verba Total, usando exatamente os mesmos valores
  // exibidos nos cards "Faturamento" e "Verba Total" desta seção.
  const roasValue = calculateRoas(
    Number(totalOrdersFormatted) || 0,
    totalAdSpendValue,
  );

  // ROAS Max. = Faturamento máximo (todos os pedidos do período) / Verba Total.
  const roasMaxValue = `Max.: ${calculateRoas(
    parseCurrency(totalPaidAllAmountFormatted) +
      totalRecorrentesClientesChatbot,
    totalAdSpendValue,
  )}`;

  // ROAS por categoria = Faturamento da categoria / Verba da categoria
  // (mesmos valores dos cards "Faturamento" e "Verba Total" detalhados).
  const roasQuadrosValue = calculateRoas(
    totalQuadrosFormatted,
    verba.googleQuadros + verba.metaQuadros,
  );
  const roasEspelhosValue = calculateRoas(
    totalEspelhosFormatted,
    verba.googleEspelhos + verba.metaEspelhos,
  );

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

  if (store === 'outlet') {
    totalCosts = sumCostsByCombinedPlatform(verba);
    // Atualiza o valor de "Geral" com o valor de "all" do TikTok ADS
    if (totalCostTikTokAll !== null) {
      totalCosts = totalCosts.map(item => {
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
  }

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
      value: roasQuadrosValue,
    },
    { name: 'Espelhos', value: roasEspelhosValue },
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
        <div className='row'>
          <BudgetItemList
            icon={FcGoogle}
            title='Verba Google'
            dataCosts={googleCosts}
            tooltip='Google ADS'
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
            handleAction={fetchDataGoogle}
            error={errorGoogle}
          />
          <BudgetItemList
            icon={FaMeta}
            iconColor='#008bff'
            title='Verba Meta'
            dataCosts={metaCosts}
            tooltip='Meta ADS'
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
            handleAction={fetchDataADSMeta}
            error={errorMeta}
          />
          <BudgetItemList
            icon={FaTiktok}
            iconColor='var(--geralblack-100)'
            title='Verba Tiktok'
            dataCosts={tiktokCostAll}
            tooltip='Tiktok ADS'
            creatives={allFullCreatives}
            value={formatCurrency(totalCostTikTokAll)}
            isLoading={loading}
            handleAction={fetchTikTokAds}
          />
          <BudgetItemList
            icon={GrMoney}
            iconColor='var(--geralblack-100)'
            title='Verba Total'
            dataCosts={totalCosts}
            tooltip='Google ADS x Meta ADS'
            value={totalAdSpend}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle}
            handleAction={handleUpdateDataADS}
          />
        </div>
        <div className='row'>
          <BudgetItemList
            icon={MdOutlineAttachMoney}
            iconColor='var(--uipositive-100)'
            title='Faturamento'
            info='Frete incluído'
            dataCosts={totalByCategory}
            tooltip='Nuvemshop'
            value={totalOrdersFormatted.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
            isLoading={isLoadingOrders}
          />
          <BudgetItemList
            icon={DiGoogleAnalytics}
            iconColor='var(--geralblack-100)'
            title='ROAS'
            tooltip='Faturamento x Verba Total'
            dataCosts={totalByCategoryOT}
            value={roasValue}
            small={title !== 'Chatbot' ? roasMaxValue : undefined}
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
  isLoadingADSGoogle,
  isLoadingOrders,
  isLoadingADSMeta,
}: DataSectionTPagoAPProps) {
  const { date, store } = useOrders();
  const { fetchDataGoogle, fetchDataADSMeta, errorMeta, errorGoogle } =
    useAnalytics();
  // Métricas de pedido vêm do orders_shop (base nova) via useStatisticsOrders,
  // que replica o filterOrders legado — inclusive o recorte de Chatbot
  // (storefront 'Loja') e Loja Física (storefront 'Loja Fisica').
  const {
    totalPaidAllAmountEcom,
    totalPaidAmountChatbot,
    totalRevenue,
    totalNovosClientes,
    totalRecorrentesClientesChatbot,
    totalPaidAllAmountFormatted,
  } = useStatisticsOrders(store, date);
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

  // Verba Total (denominador comum do ROAS Geral e do Max.).
  const totalAdSpendValue = verbaGoogleSum + verbaMetaSum;
  const totalAdSpend = formatCurrency(totalAdSpendValue);

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

  const totalChatbot = totalPaidAmountChatbot + totalRecorrentesClientesChatbot;

  const totalLojaRecorrentes = totalRevenue - totalNovosClientes;
  const totalLojaBruto = totalLojaRecorrentes + totalNovosClientes;

  //valor total de orders somando o valor de vendas de clientes novos
  const totalFaturamento =
    totalPaidAllAmountEcom + totalChatbot + totalLojaBruto;

  const totalOrdersAll = totalFaturamento.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // ROAS = Faturamento / Verba Total, usando exatamente os mesmos valores
  // exibidos nos cards "Faturamento" e "Verba Total" desta seção.
  const roasValue = calculateRoas(totalFaturamento, totalAdSpendValue);

  // ROAS Max. = Faturamento máximo (todos os pedidos do período) / Verba Total.
  const roasMaxValue = `Max.: ${calculateRoas(
    parseCurrency(totalPaidAllAmountFormatted) +
      totalRecorrentesClientesChatbot,
    totalAdSpendValue,
  )}`;

  // ROAS por categoria = Faturamento da categoria / Verba da categoria
  // (mesmos valores dos cards "Faturamento" e "Verba Total" detalhados).
  const roasEcomValue = calculateRoas(
    totalPaidAllAmountEcom,
    verba.googleEcom + verba.metaEcom,
  );
  // Numerador = totalChatbot (venda + clientes recorrentes), o mesmo valor do card
  // "Chatbot" ao lado. O legado usava só a venda; aqui vale a regra acima de o ROAS
  // refletir exatamente o que está impresso nos cards.
  const roasChatbotValue = calculateRoas(totalChatbot, verba.metaChatbot);
  const roasLojaValue = calculateRoas(totalLojaBruto, verba.googleLoja);

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
    { name: 'Chatbot', value: totalChatbot },
    { name: 'Loja Física', value: totalLojaBruto < 0 ? 0 : totalLojaBruto },
    /*
    { name: 'Novos Clientes Loja Fisica', value: totalNovosClientes },
    { name: 'Novos Clientes Chatbot', value: totalRecorrentesClientesChatbot },*/
  ];

  const totalByCategoryAP = [
    {
      name: 'Ecom',
      value: roasEcomValue,
    },
    { name: 'Chatbot', value: roasChatbotValue },
    { name: 'Loja Física', value: roasLojaValue },
    /*
    { name: 'Novos Clientes Loja Fisica', value: roasClientes },
    { name: 'Novos Clientes Chatbot', value: roasClientesChatbot },*/
  ];

  const totalByCategoryChatbot = [
    {
      name: 'Clientes Novos',
      value: totalPaidAmountChatbot < 0 ? 0 : totalPaidAmountChatbot,
    },
    {
      name: 'Clientes Recorrentes',
      value:
        totalRecorrentesClientesChatbot < 0
          ? 0
          : totalRecorrentesClientesChatbot,
    },
  ];

  const totalByCategoryLojaFisica = [
    {
      name: 'Clientes Novos',
      value: totalNovosClientes < 0 ? 0 : totalNovosClientes,
    },
    {
      name: 'Clientes Recorrentes',
      value: totalLojaRecorrentes < 0 ? 0 : totalLojaRecorrentes,
    },
  ];

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Tráfego Pago | {title}</h4>
        <div className='row'>
          <BudgetItemList
            icon={FcGoogle}
            title='Verba Google'
            dataCosts={googleCosts}
            tooltip='Google ADS'
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
            handleAction={fetchDataGoogle}
            error={errorGoogle}
          />
          <BudgetItemList
            icon={FaMeta}
            iconColor='#008bff'
            title='Verba Meta'
            dataCosts={metaCosts}
            tooltip='Meta ADS'
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
            handleAction={fetchDataADSMeta}
            error={errorMeta}
          />
          <BudgetItemList
            icon={GrMoney}
            iconColor='var(--geralblack-100)'
            title='Verba Total'
            dataCosts={totalCosts}
            tooltip='Google ADS x Meta ADS'
            value={totalAdSpend}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle}
            handleAction={handleUpdateDataADS}
          />
        </div>
        <div className='row'>
          <BudgetItemList
            icon={RiRobot2Line}
            iconColor='var(--geralblack-100)'
            title='Chatbot'
            tooltip='Faturamento Chatbot'
            value={totalChatbot.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
            dataCosts={totalByCategoryChatbot}
            isLoading={isLoadingOrders}
          />
          <BudgetItemList
            icon={SiHomeassistantcommunitystore}
            iconColor='var(--geralblack-100)'
            title='Loja Fisica'
            tooltip='Faturamento Loja Fisica'
            value={(totalLojaBruto < 0 ? 0 : totalLojaBruto).toLocaleString(
              'pt-BR',
              { style: 'currency', currency: 'BRL' },
            )}
            dataCosts={totalByCategoryLojaFisica}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className='row'>
          <BudgetItemList
            icon={MdOutlineAttachMoney}
            iconColor='var(--uipositive-100)'
            title='Faturamento'
            info='Frete incluído'
            dataCosts={totalByCategory}
            tooltip='Nuvemshop'
            value={totalOrdersAll}
            isLoading={isLoadingOrders}
          />
          <BudgetItemList
            icon={DiGoogleAnalytics}
            iconColor='var(--geralblack-100)'
            title='ROAS'
            tooltip='Faturamento x Verba Total'
            value={roasValue}
            dataCosts={totalByCategoryAP}
            small={title !== 'Chatbot' ? roasMaxValue : undefined}
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
  // Dados de pagamento agora vêm do orders_shop (payment_method/payment_status).
  const { store, date } = useOrders();
  const {
    ordersTodayPaid,
    ordersAllToday,
    loading: isLoadingOrders,
  } = useStatisticsOrders(store, date);
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
      order =>
        order.payment_details.method === method &&
        (status ? order.payment_status === status : true),
    );

  useEffect(() => {
    // Período sem pedidos precisa zerar a taxa: antes o `if` deixava o valor do
    // período ANTERIOR na tela, como se fosse do período selecionado.
    if (ordersAllToday.length === 0) {
      setPassRate('0%');
      return;
    }
    const passRateValue = (ordersTodayPaid.length / ordersAllToday.length) * 100;
    setPassRate(passRateValue.toFixed(1) + '%');
  }, [ordersAllToday, ordersTodayPaid]);

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
  }, [ordersAllToday]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Pagamento</h4>
        <div className='row'>
          <BudgetItem
            title='Pago'
            tooltip='Nuvemshop'
            value={ordersTodayPaid.length}
            isLoading={isLoadingOrders}
            orders={ordersTodayPaid}
          />
          <BudgetItem
            title='Clicado em comprar'
            tooltip='Nuvemshop'
            value={ordersAllToday.length}
            isLoading={isLoadingOrders}
            orders={ordersAllToday}
          />
          <BudgetItem
            title='Taxa de aprovação Geral'
            tooltip='Vendas x Clicado em comprar'
            value={passRate}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className='row'>
          <BudgetItem
            icon={FaCreditCard}
            iconColor={colorCard}
            title='Transações no Cartão'
            tooltip='Nuvemshop'
            value={creditCardTransactions.length}
            orders={creditCardTransactions}
            isLoading={isLoadingOrders}
            small={creditCardPercentage}
          />
          <BudgetItem
            icon={FaPix}
            iconColor={colorPix}
            title='Transações no Pix'
            tooltip='Nuvemshop'
            orders={pixTransactions}
            value={pixTransactions.length}
            isLoading={isLoadingOrders}
            small={pixPercentage}
          />
          <BudgetItem
            icon={FaFileInvoiceDollar}
            iconColor={colorBoleto}
            title='Transações no Boleto'
            tooltip='Nuvemshop'
            orders={boletoTransactions}
            value={boletoTransactions.length}
            isLoading={isLoadingOrders}
            small={boletoPercentage}
          />
        </div>
        <div className='row'>
          <BudgetItem
            icon={FaCreditCard}
            iconColor={colorCard}
            title='Taxa de Aprovação no Cartão'
            tooltip='Nuvemshop'
            value={creditCardApprovalRate}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={FaPix}
            iconColor={colorPix}
            title='Taxa de Aprovação no Pix'
            tooltip='Nuvemshop'
            value={pixApprovalRate}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={FaFileInvoiceDollar}
            iconColor={colorBoleto}
            title='Taxa de Aprovação no Boleto'
            tooltip='Nuvemshop'
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
  // Valor numérico e exibição são separados: parseCurrency só é seguro sobre
  // string BRL (num number cru ele removeria o ponto decimal).
  const adSpend =
    typeof totalAdSpend === 'number'
      ? totalAdSpend
      : parseCurrency(totalAdSpend);
  const adSpendFormatted = formatCurrency(totalAdSpend);

  // Custo de produto vem do custo CONGELADO da venda
  // (orders_shop.products_detail[].cost), já somado por pedido em
  // ordersToday[].productCost pelo useStatisticsOrders — mesma fonte que o legado
  // somava. NÃO usa custo_categoria do catálogo: aquele é o custo atual e
  // reprecificava pedidos antigos.
  const { store, date } = useOrders();
  const { ordersToday, loading: isLoadingOrders } = useStatisticsOrders(
    store,
    date,
  );

  // useMemo (e não useEffect+useState): ordersToday é referência estável e a
  // verba de ADS chega em outro fetch — derivar direto evita ficar com ADS = 0.
  const {
    productCost,
    grossProfit,
    grossMargin,
    productCostPercent,
    contributionMargin,
    totalProfit,
  } = useMemo(() => {
    // Custo por LINHA do pedido, como no legado (sem quantity). `order.productCost`
    // soma todas as linhas de products_detail sem join por SKU — somar
    // `order.products[].cost` descartaria linhas cujo SKU divergisse do array
    // `products` (ver sumFrozenCost em useStatisticsOrders).
    const totalProductCost = ordersToday.reduce(
      (totalOrderCost, order) => totalOrderCost + (Number(order.productCost) || 0),
      0,
    );

    const totalOrderValue = totalOrdersFormatted; // já é number (soma dos pagos)
    const grossProfitValue = totalOrderValue - totalProductCost;

    // Guarda apenas contra divisão por zero; negativo continua sendo calculado.
    const grossMarginValue =
      totalOrderValue > 0 ? (grossProfitValue / totalOrderValue) * 100 : 0;
    const productCostPercentValue =
      totalOrderValue > 0 ? (totalProductCost / totalOrderValue) * 100 : 0;
    const contributionMarginValue =
      grossProfitValue !== 0
        ? ((grossProfitValue - adSpend) / grossProfitValue) * 100
        : 0;

    return {
      productCost: formatCurrency(totalProductCost),
      grossProfit: formatCurrency(grossProfitValue),
      grossMargin: grossMarginValue.toFixed(2) + '%',
      productCostPercent: productCostPercentValue.toFixed(2) + '%',
      // percentual: sem formatCurrency, igual aos dois cards irmãos
      contributionMargin: contributionMarginValue.toFixed(2) + '%',
      totalProfit: formatCurrency(grossProfitValue - adSpend),
    };
  }, [ordersToday, totalOrdersFormatted, adSpend]);

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
            value={adSpendFormatted}
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

export function DataSectionCart({
  bgcolor,
  totalAdSpend,
}: DataSectionCartProps) {
  // Visitas/carrinho seguem do Google Analytics; a categorização por cupom usa
  // a tabela `coupon` do novo backend (order_ids por código e período).
  const { data, isLoadingADSGoogle } = useAnalytics();
  const { date, store } = useOrders();
  const { ordersToday, loading: isLoading } = useStatisticsOrders(store, date);
  const { coupons } = useCoupons();
  const [ordersWithCashback, setOrdersWithCashback] = useState<AdaptedOrder[]>(
    [],
  );
  const [ordersSellers, setOrdersSellers] = useState<AdaptedOrder[]>([]);
  const [cartsRecoveryPartners, setCartsRecoveryPartners] = useState<
    AdaptedOrder[]
  >([]);
  const [cartsRecoveryInsta, setCartsRecoveryInsta] = useState<AdaptedOrder[]>(
    [],
  );
  const [cartsRecoveryInstaDirect, setCartsRecoveryInstaDirect] = useState<
    AdaptedOrder[]
  >([]);
  const [cartsRecoveryWhats, setCartsRecoveryWhats] = useState<AdaptedOrder[]>(
    [],
  );
  const [cartsRecoveryEmail, setCartsRecoveryEmail] = useState<AdaptedOrder[]>(
    [],
  );
  const [cartsRecoveryPopup, setCartsRecoveryPopup] = useState<AdaptedOrder[]>(
    [],
  );
  const [cartsRecoveryGanhei15, setCartsRecoveryGanhei15] = useState<
    AdaptedOrder[]
  >([]);

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
    'CIBELE5',
    'CLAUDIO5',
    'DIEGO5',
    'IAGO5',
    'LARISSA5',
    'CIBELE10',
    'CLAUDIO10',
    'DIEGO10',
    'IAGO10',
    'LARISSA10',
    'CIBELE15',
    'CLAUDIO15',
    'DIEGO15',
    'IAGO15',
    'LARISSA15',
  ];
  const couponsInsta = ['INSTA10', 'INSTA20', 'VIP10', 'LIVE20'];
  const couponsWhats = ['WHATS5', 'WHATS10', 'WHATS15', 'WHATS20'];
  const couponsEmail =
    store === 'outlet' ? ['OUTLET10', 'GANHEI10'] : ['GANHEI10'];
  const couponsPopup =
    store === 'outlet' ? ['GANHEI5', 'FRETEGRATIS'] : ['GANHEI10', 'GANHEI5'];
  const couponsGanhei15 = store === 'outlet' ? ['GANHEI15'] : ['GANHEI15'];

  const couponsCashback = coupons.filter((coupon: CouponProps) =>
    coupon.code.startsWith('MTZ'),
  );

  useEffect(() => {
    // Zera todos os cards de cupom. Necessário porque o efeito tem caminhos de saída
    // antecipada (período sem pedidos / falha na busca): sem isso, os pedidos do período
    // ANTERIOR continuariam na tela e nos popups.
    const resetAll = () => {
      setCartsRecoveryWhats([]);
      setCartsRecoveryInsta([]);
      setCartsRecoveryInstaDirect([]);
      setCartsRecoveryPartners([]);
      setCartsRecoveryEmail([]);
      setCartsRecoveryPopup([]);
      setCartsRecoveryGanhei15([]);
      setOrdersSellers([]);
      setOrdersWithCashback([]);
    };

    if (!ordersToday.length || !date) {
      resetAll();
      return;
    }

    const start = formatDate(date[0]);
    const end = formatDate(date[1]);

    // Lookup rápido: order_id → AdaptedOrder (pedidos já carregados).
    // Chave normalizada para String: orders_shop.order_id (bigint) e os
    // order_ids da tabela coupon (JSONB) podem chegar como number OU string,
    // e Map.get usa SameValueZero (get(123) !== get('123')).
    const orderIdMap = new Map<string, AdaptedOrder>();
    for (const order of ordersToday) {
      orderIdMap.set(String(order.order_id), order);
    }

    // Acumula os order_ids das linhas de cupom que passam no predicado.
    // order_ids é JSONB: pode chegar null/ausente, por isso o guard de array.
    const collectIds = (
      couponRows: CouponRow[],
      match: (name: string) => boolean,
    ): AdaptedOrder[] => {
      const ids = new Set<string>();
      couponRows
        .filter(c => match((c.name ?? '').trim().toUpperCase()))
        .forEach(c => {
          if (Array.isArray(c.order_ids)) {
            c.order_ids.forEach(id => ids.add(String(id)));
          }
        });
      return [...ids]
        .map(id => orderIdMap.get(id))
        .filter((o): o is AdaptedOrder => o !== undefined);
    };

    // Resolve orders a partir dos order_ids da tabela coupon (busca exata por código)
    const resolveOrders = (
      couponRows: CouponRow[],
      codes: string[],
    ): AdaptedOrder[] => {
      const wanted = new Set(codes.map(c => c.trim().toUpperCase()));
      return collectIds(couponRows, name => wanted.has(name));
    };

    // Resolve cashback (prefixo MTZ)
    const resolveMTZ = (couponRows: CouponRow[]): AdaptedOrder[] =>
      collectIds(couponRows, name => name.startsWith('MTZ'));

    // Guard de corrida: ao trocar rápido de período/loja, a resposta antiga não
    // pode sobrescrever a nova (mesmo padrão de BestSellers).
    let active = true;

    fetchTable<CouponRow>(DatabaseTable.COUPON, {
      store,
      startDate: start,
      endDate: end,
    })
      .then(couponRows => {
        if (!active) return;
        setCartsRecoveryWhats(resolveOrders(couponRows, couponsWhats));
        setCartsRecoveryInsta(resolveOrders(couponRows, couponsInsta));
        setCartsRecoveryInstaDirect([]);
        setCartsRecoveryPartners(resolveOrders(couponRows, couponsPartners));
        setCartsRecoveryEmail(resolveOrders(couponRows, couponsEmail));
        setCartsRecoveryPopup(resolveOrders(couponRows, couponsPopup));
        setCartsRecoveryGanhei15(resolveOrders(couponRows, couponsGanhei15));
        setOrdersSellers(resolveOrders(couponRows, couponsSellers));
        setOrdersWithCashback(resolveMTZ(couponRows));
      })
      .catch(err => {
        if (!active) return;
        // Contadores voltam a 0, mas registra a falha para diagnóstico.
        resetAll();
        console.warn('[DataSectionCart] falha ao buscar tabela coupon:', err);
      });

    return () => {
      active = false;
    };
  }, [ordersToday, store, date]);

  useEffect(() => {
    if (data) {
      const { totalVisits, carts } = data;
      setVisits(totalVisits.toLocaleString('pt-BR'));
      setCarts(carts.toLocaleString('pt-BR'));
    }
  }, [data, ordersToday]);

  useEffect(() => {
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    // A guarda anterior era `(totalAdSpend && numericCarts) !== 0`, que avalia o
    // `&&` PRIMEIRO e só então compara com 0 — não testava os dois operandos.
    // Com `carts` em '0' o efeito era pulado e o custo do período ANTERIOR ficava
    // na tela; com `carts` em '-' o parseInt dava NaN, `NaN !== 0` é true e a
    // tela mostrava "R$ NaN".
    if (!Number.isFinite(numericCarts) || numericCarts === 0 || !totalAdSpend) {
      setCostCart(formatCurrency(0));
      return;
    }
    setCostCart(formatCurrency(totalAdSpend / numericCarts));
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

  const rateCouponGanhei15 = useMemo(
    () => calculatePopupRate(ordersToday, cartsRecoveryGanhei15),
    [ordersToday, cartsRecoveryGanhei15],
  );

  const totalCashbackSales = ordersWithCashback.length;
  const totalCashbackRevenue = ordersWithCashback.reduce((sum, order) => {
    return sum + parseFloat(order.total);
  }, 0);

  const totalCashbackValue = ordersWithCashback.reduce((sum, order) => {
    const coupon = order.coupon.find(c => c.code.startsWith('MTZ'));
    return sum + (coupon ? parseFloat(coupon.value) : 0);
  }, 0);

  const costCashback =
    totalCashbackValue > 0 ? formatCurrency(totalCashbackValue) : 'R$ 0,00';
  const roiCashback =
    totalCashbackValue > 0
      ? (totalCashbackRevenue / totalCashbackValue).toFixed(2)
      : '0.00';
  const ganhei15Today = ordersToday.filter(
    item =>
      item.coupon && item.coupon.some(coupon => coupon.code === 'GANHEI15'),
  );
  // useEffect para testes
  /*
  useEffect(() => {
    console.log('Debug data', ordersToday);
    console.log('Debug data cupom', cartsRecoveryGanhei15);
    console.log('Debug data filter', ganhei15Today);
  }, [data, ordersToday]);
  */

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Carrinho e Cupom</h4>
        <div className='row'>
          <BudgetItem
            title='Carrinhos criados'
            tooltip='Google Analytics'
            value={carts}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            title='Taxa de carrinho'
            tooltip='Carrinhos x Sessões'
            value={cartRate}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            title='Custo de carrinho'
            tooltip='Vendas x Carrinhos'
            value={costCarts}
            isLoading={isLoadingADSGoogle}
          />
        </div>
        <div className='row'>
          <BudgetItemList
            icon={FaWhatsapp}
            iconColor={'var(--uipositive-100)'}
            title='Cupom Whatsapp'
            small={rateCouponWhats}
            tooltip={`Cupons: ${couponsWhats.join(', ')}`}
            value={cartsRecoveryWhats.length}
            isLoading={isLoading}
            dataCosts={generateDataCosts(cartsRecoveryWhats, couponsWhats)}
            orders={cartsRecoveryWhats}
          />
          <BudgetItemList
            title='Cupom Instagram'
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
              {/*<BudgetItemList
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
              /> */}
              <BudgetItemList
                icon={FaHandshakeSimple}
                title='Cupom Parceria'
                small={rateCouponPartners}
                tooltip='Pedidos com cupom de parceria'
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
                title='Cupom Email'
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
            title='Cupom Popup'
            small={rateCouponPopup}
            tooltip='Pedidos realizados com cupom do Popup'
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
          {store === 'outlet' && (
            <>
              <BudgetItemList
                icon={MdOutlineSell}
                title='Cupom Remarketing'
                small={rateCouponGanhei15}
                tooltip={`Cupons: ${couponsGanhei15.join(', ')}`}
                value={cartsRecoveryGanhei15.length}
                isLoading={isLoading}
                dataCosts={generateDataCosts(
                  cartsRecoveryGanhei15,
                  couponsGanhei15,
                )}
                orders={cartsRecoveryGanhei15}
              />
            </>
          )}
          {store === 'artepropria' && (
            <BudgetItemList
              icon={FaPeopleGroup}
              title='Cupom Vendedores'
              small={rateCouponSellers}
              tooltip='Pedidos realizados com cupom de vendedor'
              value={ordersSellers.length}
              isLoading={isLoading}
              dataCosts={generateDataCosts(ordersSellers, couponsSellers)}
              orders={ordersSellers}
            />
          )}
        </div>
        <div className='row'>
          <BudgetItem
            title='Cupom Cashback'
            tooltip='Vendas com Cashback'
            value={totalCashbackSales}
            small={couponsCashback.length}
            isLoading={isLoading}
          />
          <BudgetItem
            title='Faturamento Cashback'
            tooltip='Vendas com Cashback (R$)'
            value={formatCurrency(totalCashbackRevenue)}
            small={`ROI: ${roiCashback}`}
            isLoading={isLoading}
          />
          <BudgetItem
            title='Custo Cashback'
            tooltip='Custo com cashback'
            value={costCashback}
            isLoading={isLoading}
          />
        </div>
      </ContainerGeral>
      {/*
      store === 'outlet' && (
        <ContainerCharts>
          <ChartLine
            title="Cupons GANHEI15 por período"
            orders={ganhei15Today}
            loading={isLoading}
          />
        </ContainerCharts>
      )*/}
    </ContainerOrders>
  );
}

export function DataSectionAnalytics({
  bgcolor,
  totalAdSpend,
}: DataSectionAnalyticsProps) {
  const { data, isLoadingADSGoogle: isLoadingAnalytics } = useAnalytics();
  // Pedidos vêm do orders_shop (base nova) via useStatisticsOrders.
  // `customers` (inscrições do Popup) permanece no legado: a base nova não
  // expõe rota de clientes filtrável por período (só acesso por id).
  const { date, store, customers, isLoadingCustomers } = useOrders();
  const { ordersToday, loading: isLoadingOrders } = useStatisticsOrders(
    store,
    date,
  );
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
    // Ticket médio = média do total dos pedidos do período (mesmo cálculo do
    // calculateAverageTicket legado; Number() cobre o total do orders_shop).
    const ticket = ordersToday.length
      ? ordersToday.reduce((sum, o) => sum + Number(o.total), 0) /
        ordersToday.length
      : 0;
    setAverageTicket(formatCurrency(ticket));
  }, [date, ordersToday]);

  const conversionRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((ordersToday.length / numericVisits) * 100).toFixed(2) + '%'
      : '0.00%';
  }, [ordersToday.length, visits]);

  const customersRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((customers.length / numericVisits) * 100).toFixed(2) + '%'
      : '0.00%';
  }, [customers.length, visits]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Analytics</h4>
        <div className='row'>
          <BudgetItem
            title='Sessões'
            tooltip='Google Analytics'
            value={visits}
            isLoading={isLoadingAnalytics}
          />
          <BudgetItem
            title='Vendas'
            tooltip='Nuvemshop (Geral)'
            value={ordersToday.length}
            isLoading={isLoadingOrders}
            orders={ordersToday}
          />
          <BudgetItem
            title='Taxa de conversão'
            tooltip='Sessões x Vendas'
            value={conversionRate}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className='row'>
          <BudgetItem
            title='Ticket Médio'
            tooltip='Nuvemshop'
            value={averageTicket}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo p/ Sessão (CPS)'
            tooltip='Verba Total / Sessões'
            value={priceSession}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo p/ Aquisição (CPA)'
            tooltip='Verba Total / Vendas'
            value={priceAcquisition}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className='row'>
          <BudgetItem
            title='Inscrições Popup'
            tooltip='Clientes que se inscreveram no Popup'
            value={customers.length}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Taxa de engajamento'
            tooltip='Inscrições x Sessões'
            value={customersRate}
            isLoading={isLoadingCustomers}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}

export function DataSectionReembolso({ bgcolor }: { bgcolor: string }) {
  const { reembolsos, summaryReembolsos, loading, error, fetchRefunds } =
    useRefunds();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const totalCountByType = [
    {
      name: 'Total',
      value: summaryReembolsos.type_refunds.Total.count,
    },
    {
      name: 'Parcial',
      value: summaryReembolsos.type_refunds.Parcial.count,
    },
  ];

  const totalByType = [
    {
      name: 'Total',
      value: summaryReembolsos.type_refunds.Total.value,
    },
    {
      name: 'Parcial',
      value: summaryReembolsos.type_refunds.Parcial.value,
    },
  ];

  const handleIsOpenPopup = () => {
    setIsPopupOpen(true);
  };
  const handleIsClosePopup = () => {
    setIsPopupOpen(false);
  };
  const atrasosCountRefunds = reembolsos.filter(
    refund => refund.category === 'Atraso',
  );
  const naoGostouCountRefunds = reembolsos.filter(
    refund => refund.category === 'Não gostou',
  );
  const logisticaCountRefunds = reembolsos.filter(
    refund => refund.category === 'Envio/Logistica',
  );
  const defeitoQuadrosCountRefunds = reembolsos.filter(
    refund => refund.category === 'Produção/Defeito - Quadros',
  );
  const defeitoEspelhosCountRefunds = reembolsos.filter(
    refund => refund.category === 'Produção/Defeito - Espelhos',
  );
  const opErradaCountRefunds = reembolsos.filter(
    refund => refund.category === 'OP Errada',
  );
  const avariaCountRefunds = reembolsos.filter(
    refund => refund.category === 'Avaria',
  );
  const extravioCountRefunds = reembolsos.filter(
    refund => refund.category === 'Extravio',
  );
  const trocaCountRefunds = reembolsos.filter(
    refund => refund.category === 'Troca',
  );
  const compraErradaCountRefunds = reembolsos.filter(
    refund => refund.category === 'Compra errada',
  );
  /*
  if (loading) {
    return <p>Carregando reembolsos...</p>;
  }*/

  if (error) {
    return <p>Erro ao carregar reembolsos: {error}</p>;
  }

  return (
    <>
      <ContainerOrders>
        <ContainerGeral bgcolor={bgcolor}>
          <div className='title-box'>
            <h4>Reembolsos</h4>
            <TooltipInfo
              className={`btn-plus ${error && 'error'}`}
              title={'Cadastrar Reembolsos'}
            >
              <FaPlus size={24} onClick={handleIsOpenPopup} />
            </TooltipInfo>
          </div>
          <div className='row'>
            <BudgetItemListNumber
              title='Total Reembolsos'
              tooltip='Total de reenvios feitos'
              value={summaryReembolsos.type.Reembolso.count}
              isLoading={loading}
              dataCosts={totalCountByType}
              refunds={reembolsos}
            />
            <BudgetItemList
              title='Valor Total'
              tooltip='Valor total reembolsado'
              value={`R$ ${summaryReembolsos.type.Reembolso.value.toFixed(2)}`}
              isLoading={loading}
              dataCosts={totalByType}
              refunds={reembolsos}
            />
          </div>
          <div className='row'>
            <BudgetItem
              title='Atraso'
              tooltip='Reembolsos por atraso.'
              value={summaryReembolsos.categories.Atraso.count}
              small={`R$ ${summaryReembolsos.categories.Atraso.value.toFixed(2)}`}
              isLoading={loading}
              refunds={atrasosCountRefunds}
            />
            <BudgetItem
              title='Não Gostou'
              tooltip='Reembolsos por insatisfação.'
              value={summaryReembolsos.categories['Não gostou'].count}
              small={`R$ ${summaryReembolsos.categories['Não gostou'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={naoGostouCountRefunds}
            />
            <BudgetItem
              title='Avaria'
              tooltip='Reembolsos por avaria.'
              value={summaryReembolsos.categories.Avaria.count}
              small={`R$ ${summaryReembolsos.categories.Avaria.value.toFixed(2)}`}
              isLoading={loading}
              refunds={avariaCountRefunds}
            />
          </div>
          <div className='row'>
            <BudgetItem
              title='Envio/Logistica'
              tooltip='Reembolsos devido problemas no Envio.'
              value={summaryReembolsos.categories['Envio/Logistica'].count}
              small={`R$ ${summaryReembolsos.categories['Envio/Logistica'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={logisticaCountRefunds}
            />
            <BudgetItem
              title='Troca'
              tooltip='Reembolsos por Troca do produto.'
              value={summaryReembolsos.categories.Troca.count}
              small={`R$ ${summaryReembolsos.categories.Troca.value.toFixed(2)}`}
              isLoading={loading}
              refunds={trocaCountRefunds}
            />
            <BudgetItem
              title='Produção/Defeito - Quadros'
              tooltip='Reembolsos por Quadros defeituosos.'
              value={
                summaryReembolsos.categories['Produção/Defeito - Quadros'].count
              }
              small={`R$ ${summaryReembolsos.categories['Produção/Defeito - Quadros'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={defeitoQuadrosCountRefunds}
            />
          </div>
          <div className='row'>
            <BudgetItem
              title='Produção/Defeito - Espelhos'
              tooltip='Reembolsos por Espelhos defeituosos.'
              value={
                summaryReembolsos.categories['Produção/Defeito - Espelhos']
                  .count
              }
              small={`R$ ${summaryReembolsos.categories['Produção/Defeito - Espelhos'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={defeitoEspelhosCountRefunds}
            />
            <BudgetItem
              title='OP Errada'
              tooltip='Quando a Ordem de Pedido foi gerada erroneamente.'
              value={summaryReembolsos.categories['OP Errada'].count}
              small={`R$ ${summaryReembolsos.categories['OP Errada'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={opErradaCountRefunds}
            />
            <BudgetItem
              title='Extravio'
              tooltip='Reembolso devido a Extravio do pedido durante percurso.'
              value={summaryReembolsos.categories.Extravio.count}
              small={`R$ ${summaryReembolsos.categories.Extravio.value.toFixed(2)}`}
              isLoading={loading}
              refunds={extravioCountRefunds}
            />
            <BudgetItem
              title='Compra Errada'
              tooltip='Quando o cliente efetua a compra do produto erroneamente.'
              value={summaryReembolsos.categories['Compra errada'].count}
              small={`R$ ${summaryReembolsos.categories['Compra errada'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={compraErradaCountRefunds}
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

export function DataSectionReenvio({ bgcolor }: { bgcolor: string }) {
  const { reenvios, summaryReenvios, loading, error } = useRefunds();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleIsOpenPopup = () => {
    setIsPopupOpen(true);
  };
  const handleIsClosePopup = () => {
    setIsPopupOpen(false);
  };
  /*
  if (loading) {
    return <p>Carregando reenvios...</p>;
  }*/

  const atrasosCountRefunds = reenvios.filter(
    refund => refund.category === 'Atraso',
  );
  const naoGostouCountRefunds = reenvios.filter(
    refund => refund.category === 'Não gostou',
  );
  const logisticaCountRefunds = reenvios.filter(
    refund => refund.category === 'Envio/Logistica',
  );
  const defeitoQuadrosCountRefunds = reenvios.filter(
    refund => refund.category === 'Produção/Defeito - Quadros',
  );
  const defeitoEspelhosCountRefunds = reenvios.filter(
    refund => refund.category === 'Produção/Defeito - Espelhos',
  );
  const opErradaCountRefunds = reenvios.filter(
    refund => refund.category === 'OP Errada',
  );
  const avariaCountRefunds = reenvios.filter(
    refund => refund.category === 'Avaria',
  );
  const extravioCountRefunds = reenvios.filter(
    refund => refund.category === 'Extravio',
  );
  const trocaCountRefunds = reenvios.filter(
    refund => refund.category === 'Troca',
  );
  const compraErradaCountRefunds = reenvios.filter(
    refund => refund.category === 'Compra errada',
  );

  if (error) {
    return <p>Erro ao carregar reenvios: {error}</p>;
  }

  return (
    <>
      <ContainerOrders>
        <ContainerGeral bgcolor={bgcolor}>
          <div className='title-box'>
            <h4>Reenvios</h4>
            <TooltipInfo
              className={`btn-plus ${error && 'error'}`}
              title={'Cadastrar Reenvio'}
            >
              <FaPlus size={24} onClick={handleIsOpenPopup} />
            </TooltipInfo>
          </div>
          <div className='row'>
            <BudgetItemListNumber
              title='Total Reenvios'
              tooltip='Total de reenvios feitos'
              value={summaryReenvios.type.Reenvio.count}
              isLoading={loading}
              refunds={reenvios}
            />
            <BudgetItemList
              title='Valor Total'
              tooltip='Valor total reenvios'
              value={`R$ ${summaryReenvios.type.Reenvio.value.toFixed(2)}`}
              isLoading={loading}
              refunds={reenvios}
            />
          </div>
          <div className='row'>
            <BudgetItem
              title='Atraso'
              tooltip='Reenvio por atraso da Transportadora.'
              value={summaryReenvios.categories.Atraso.count}
              small={`R$ ${summaryReenvios.categories.Atraso.value.toFixed(2)}`}
              isLoading={loading}
              refunds={atrasosCountRefunds}
            />
            <BudgetItem
              title='Não Gostou'
              tooltip='Reenvio por insatisfação.'
              value={summaryReenvios.categories['Não gostou'].count}
              small={`R$ ${summaryReenvios.categories['Não gostou'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={naoGostouCountRefunds}
            />
            <BudgetItem
              title='Avaria'
              tooltip='Reenvio por avaria.'
              value={summaryReenvios.categories.Avaria.count}
              small={`R$ ${summaryReenvios.categories.Avaria.value.toFixed(2)}`}
              isLoading={loading}
              refunds={avariaCountRefunds}
            />
          </div>
          <div className='row'>
            <BudgetItem
              title='Envio/Logistica'
              tooltip='Reenvio devido problemas no Envio.'
              value={summaryReenvios.categories['Envio/Logistica'].count}
              small={`R$ ${summaryReenvios.categories['Envio/Logistica'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={logisticaCountRefunds}
            />
            <BudgetItem
              title='Troca'
              tooltip='Reenvio devido a Troca do produto.'
              value={summaryReenvios.categories.Troca.count}
              small={`R$ ${summaryReenvios.categories.Troca.value.toFixed(2)}`}
              isLoading={loading}
              refunds={trocaCountRefunds}
            />
            <BudgetItem
              title='Produção/Defeito - Quadros'
              tooltip='Reenvio por Quadros defeituosos.'
              value={
                summaryReenvios.categories['Produção/Defeito - Quadros'].count
              }
              small={`R$ ${summaryReenvios.categories['Produção/Defeito - Quadros'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={defeitoQuadrosCountRefunds}
            />
          </div>
          <div className='row'>
            <BudgetItem
              title='Produção/Defeito - Espelhos'
              tooltip='Reenvio por Espelhos defeituosos.'
              value={
                summaryReenvios.categories['Produção/Defeito - Espelhos'].count
              }
              small={`R$ ${summaryReenvios.categories['Produção/Defeito - Espelhos'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={defeitoEspelhosCountRefunds}
            />
            <BudgetItem
              title='OP Errada'
              tooltip='Quando a Ordem de Pedido foi gerada erroneamente.'
              value={summaryReenvios.categories['OP Errada'].count}
              small={`R$ ${summaryReenvios.categories['OP Errada'].value.toFixed(2)}`}
              isLoading={loading}
              refunds={opErradaCountRefunds}
            />
            <BudgetItem
              title='Extravio'
              tooltip='Reenvio devido a Extravio do pedido durante percurso.'
              value={summaryReenvios.categories.Extravio.count}
              small={`R$ ${summaryReenvios.categories.Extravio.value.toFixed(2)}`}
              isLoading={loading}
              refunds={extravioCountRefunds}
            />
          </div>
        </ContainerGeral>
      </ContainerOrders>
      <RefundPopupReenvio
        isPopupOpen={isPopupOpen}
        handleIsClosePopup={handleIsClosePopup}
      />
    </>
  );
}
