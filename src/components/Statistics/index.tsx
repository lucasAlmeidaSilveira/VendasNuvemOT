import React, { useEffect, useState, useMemo } from 'react';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { useTikTokAds } from '../../context/TikTokAdsContext';
import {
  Chart,
  ChartLine,
  ChartStates,
  ChartLojas,
  ChartClienteLojas,
} from '../Chart';
import {
  DataSectionAnalytics,
  DataSectionCart,
  DataSectionCosts,
  DataSectionPay,
  DataSectionReembolso,
  DataSectionReenvio,
  DataSectionTPago,
  DataSectionTPagoAP,
} from './Sections';
import {
  calculateRoas,
  formatCurrency,
  parseCurrency,
} from '../../tools/tools';
import { Container, ContainerCharts } from './styles';
import { Popup } from '../Popup';
import { Button } from '../Button';
import { ConfirmationDialog } from '../Products/ConfirmationDialog';
import { DialogContent, DialogActions, styled } from '@mui/material';
import { ContainerButton } from '../Orders/styles';
import { RefundPopup } from '../Refunds/RefundsPopup';

export function Statistics() {
  const { data, dataADSMeta, isLoadingADSGoogle, isLoadingADSMeta } =
    useAnalytics();
  const { allOrders, isLoading, date, store } = useOrders();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { adsData, loading, error, fetchTikTokAds, totalCostTikTokAll } =
    useTikTokAds();
  const [usersByDevice, setUsersByDevice] = useState({});
  const [adSpends, setAdSpends] = useState({
    google: 0,
    googleEcom: 0,
    googleQuadros: 0,
    googleEspelhos: 0,
    googleLoja: 0,
    googleGeral: 0,
    meta: 0,
    metaEcom: 0,
    metaChatbot: 0,
    metaQuadros: 0,
    metaEspelhos: 0,
    metaInstagram: 0,
    metaGeral: 0,
  });

  // Filtros para pedidos
  const {
    ordersToday,
    totalRevenue,
    totalPaidAmountFormatted,
    totalPaidAllAmountFormatted,
    totalPaidAmountChatbotFormatted,
    totalPaidAllAmountEcom,
    totalQuadros,
    totalEspelhos,
    totalNovosClientes,
    totalNovosClientesChatbot,
  } = filterOrders(allOrders, date);

  useEffect(() => {
    if (data) {
      setUsersByDevice(data.usersByDevice);
      setAdSpends(prev => ({
        ...prev,
        google: data.totalCost.all,
        googleEcom: data.totalCost.ecom,
        googleQuadros: data.totalCost.quadros,
        googleEspelhos: data.totalCost.espelhos,
        googleLoja: data.totalCost.loja,
        googleGeral: data.totalCost.geral,
      }));
    }
    if (dataADSMeta?.length > 0) {
      const firstEntry = dataADSMeta[0];
      setAdSpends(prev => ({
        ...prev,
        meta: firstEntry.totalCost.all,
        metaEcom: firstEntry.totalCost.ecom,
        metaChatbot: firstEntry.totalCost.chatbot,
        metaQuadros: firstEntry.totalCost.quadros,
        metaEspelhos: firstEntry.totalCost.espelhos,
        metaInstagram: firstEntry.totalCost.instagram,
        metaGeral: firstEntry.totalCost.geral,
      }));
    }
  }, [data, dataADSMeta]);

  // Cálculo total de gastos e ROAS
  const totalAdSpend = useMemo(() => {
    if (store === 'outlet') {
      return adSpends.google + adSpends.meta + (totalCostTikTokAll || 0);
    }
    if (store === 'artepropria') {
      return adSpends.google + adSpends.meta;
    }
    return 0; // Fallback para outros casos
  }, [adSpends]);
  const totalAdSpendEcom = useMemo(
    () => adSpends.googleEcom + adSpends.metaEcom,
    [adSpends],
  );
  const totalAdSpendChatbot = useMemo(() => adSpends.metaChatbot, [adSpends]);
  const totalAdSpendLoja = useMemo(() => adSpends.googleLoja, [adSpends]);

  const totalAdSpendQuadros = useMemo(
    () => adSpends.googleQuadros + adSpends.metaQuadros,
    [adSpends],
  );

  const totalAdSpendEspelhos = useMemo(
    () => adSpends.googleEspelhos + adSpends.metaEspelhos,
    [adSpends],
  );

  const totalAllClients = totalNovosClientes + totalPaidAmountFormatted + totalNovosClientesChatbot;
  const totalMaxAllClients =
    parseCurrency(totalPaidAllAmountFormatted) + totalNovosClientes;

  const roas = calculateRoas(totalAllClients, totalAdSpend);
  const roasQuadros = calculateRoas(totalQuadros, totalAdSpendQuadros);
  const roasEspelhos = calculateRoas(totalEspelhos, totalAdSpendEspelhos);
  const roasClientes = calculateRoas(totalNovosClientes, totalAdSpendLoja);
  const roasClientesChatbot = calculateRoas(
    totalNovosClientesChatbot,
    totalAdSpendLoja,
  );

  const roasEcom = calculateRoas(totalPaidAllAmountEcom, totalAdSpendEcom);

  const roasLoja = calculateRoas(totalRevenue, totalAdSpendLoja);

  const roasChatbot = calculateRoas(
    parseCurrency(totalPaidAmountChatbotFormatted),
    totalAdSpendChatbot,
  );
  const roasMax = calculateRoas(totalMaxAllClients, totalAdSpend);

  // Adicione um novo cálculo específico para o TikTok se necessário
  const roasTikTok = calculateRoas(
    parseCurrency(totalPaidAmountFormatted), // Ou outra métrica de receita específica
    totalCostTikTokAll,
  );

  // Cores de fundo para diferentes seções
  const bgColors = {
    trafegoPago: '#525252',
    costs: '#978800',
    analytics: '#006BC8',
    conversaoVendas: '#592DEA',
    payment: '#008006',
    planilhaAnalytics: '#7002d0',
    reembolso: '#633B48',
  };

  return (
    <Container>
      {store === 'outlet' ? (
        <DataSectionTPago
          title='Geral'
          bgcolor={bgColors.trafegoPago}
          verba={adSpends}
          totalOrdersFormatted={totalPaidAmountFormatted}
          roas={roas}
          roasEspelhos={roasEspelhos}
          roasQuadros={roasQuadros}
          roasMax={`Max.: ${roasMax}`}
          isLoadingADSGoogle={isLoadingADSGoogle}
          isLoadingOrders={isLoading}
          isLoadingADSMeta={isLoadingADSMeta}
        />
      ) : (
        <DataSectionTPagoAP
          title='Geral'
          bgcolor={bgColors.trafegoPago}
          verba={adSpends}
          totalOrdersFormatted={totalPaidAmountFormatted}
          roas={roas}
          roasEcom={roasEcom}
          roasLoja={roasLoja}
          roasChatbot={roasChatbot}
          roasClientes={roasClientes}
          roasClientesChatbot={roasClientesChatbot}
          roasMax={`Max.: ${roasMax}`}
          isLoadingADSGoogle={isLoadingADSGoogle}
          isLoadingOrders={isLoading}
          isLoadingADSMeta={isLoadingADSMeta}
        />
      )}

      <DataSectionAnalytics
        bgcolor={bgColors.analytics}
        totalAdSpend={totalAdSpend}
      />
      <DataSectionReembolso bgcolor={bgColors.reembolso} />
      <DataSectionReenvio bgcolor={bgColors.reembolso} />
      <DataSectionCart
        bgcolor={bgColors.conversaoVendas}
        totalAdSpend={totalAdSpend}
      />
      <DataSectionPay bgcolor={bgColors.payment} />
      <DataSectionCosts
        bgcolor={bgColors.costs}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalPaidAmountFormatted}
        isLoadingADSGoogle={isLoadingADSGoogle}
        isLoadingADSMeta={isLoadingADSMeta}
      />

      <ContainerCharts>
        <Chart
          title='Sessões por dispositivo'
          usersByDevice={usersByDevice}
          loading={isLoadingADSGoogle}
        />
        <ChartStates
          title='Vendas por estado'
          orders={ordersToday}
          loading={isLoading}
        />
      </ContainerCharts>

      <ContainerCharts>
        <ChartLine
          title='Vendas por período'
          orders={ordersToday}
          loading={isLoading}
        />
      </ContainerCharts>
      <ContainerCharts>
        {store === 'artepropria' && (
          <>
            <ChartLojas
              title='Vendas por Loja'
              orders={ordersToday}
              loading={isLoading}
            />
            <ChartClienteLojas
              title='Número de Clientes por Loja'
              orders={ordersToday}
              loading={isLoading}
            />
          </>
        )}
      </ContainerCharts>
    </Container>
  );
}
