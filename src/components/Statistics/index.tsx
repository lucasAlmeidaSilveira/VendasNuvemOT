import React, { useEffect, useState, useMemo } from 'react';
import { useStatisticsOrders } from '../../hooks/useStatisticsOrders';
import { useAdsSpend } from '../../hooks/useAdsSpend';
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
import { Container, ContainerCharts } from './styles';
import { Popup } from '../Popup';
import { Button } from '../Button';
import { ConfirmationDialog } from '../Products/ConfirmationDialog';
import { DialogContent, DialogActions, styled } from '@mui/material';
import { ContainerButton } from '../Orders/styles';
import { RefundPopup } from '../Refunds/RefundsPopup';

export function Statistics() {
  // `data` segue do Google Analytics (sessões/conversão). isLoadingADSGoogle
  // é usado só no gráfico de sessões. A verba de ADS vem da tabela `ads`.
  const { data, isLoadingADSGoogle } = useAnalytics();
  const { date, store } = useOrders();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { adsData, loading, error, fetchTikTokAds, totalCostTikTokAll } =
    useTikTokAds();
  const [usersByDevice, setUsersByDevice] = useState({});

  // Verba de anúncios (Google + Meta) agora vem da tabela `ads` do novo
  // backend (mesmo formato do legado, alimenta verba/totalAdSpend das seções).
  const { adSpends, loading: isLoadingAds } = useAdsSpend(store, date);

  // Métricas de pedidos replicando o filterOrders legado, agora sobre
  // orders_shop (+ catálogo). Loja Física/Chatbot = 0 (descontinuados).
  const {
    ordersToday,
    totalPaidAmountFormatted,
    loading: isLoading,
  } = useStatisticsOrders(store, date);

  // Sessões por dispositivo continuam vindo do Google Analytics (conversão,
  // sem equivalente no novo backend). A verba de ADS migrou p/ a tabela `ads`.
  useEffect(() => {
    if (data) {
      setUsersByDevice(data.usersByDevice);
    }
  }, [data]);

  // Verba Total (Google + Meta + TikTok) usada pelas seções Analytics/Cart/Costs.
  const totalAdSpend = useMemo(() => {
    if (store === 'outlet') {
      return (
        adSpends.googleQuadros +
        adSpends.metaQuadros +
        adSpends.googleEspelhos +
        adSpends.metaEspelhos +
        adSpends.metaGeral +
        adSpends.googleGeral +
        (totalCostTikTokAll || 0)
      );
    } else if (store === 'artepropria') {
      // Verba de adds composta por ecom, loja, chat e insta
      return (
        adSpends.googleEcom +
        adSpends.metaEcom +
        adSpends.metaChatbot +
        adSpends.googleLoja +
        adSpends.metaInstagram
      );
      //return adSpends.google + adSpends.meta;
    }
    return 0; // Fallback para outros casos
  }, [adSpends]);

  // O ROAS (Geral, Max. e por categoria) é calculado dentro de cada seção
  // (DataSectionTPago / DataSectionTPagoAP), a partir dos mesmos valores de
  // Faturamento e Verba Total exibidos nos cards.

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
          isLoadingADSGoogle={isLoadingAds}
          isLoadingOrders={isLoading}
          isLoadingADSMeta={isLoadingAds}
        />
      ) : (
        <DataSectionTPagoAP
          title='Geral'
          bgcolor={bgColors.trafegoPago}
          verba={adSpends}
          totalOrdersFormatted={totalPaidAmountFormatted}
          isLoadingADSGoogle={isLoadingAds}
          isLoadingOrders={isLoading}
          isLoadingADSMeta={isLoadingAds}
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
        isLoadingADSGoogle={isLoadingAds}
        isLoadingADSMeta={isLoadingAds}
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
