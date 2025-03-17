import React, { useEffect, useState, useMemo } from 'react';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine, ChartStates } from '../Chart';
import {
  DataSectionAnalytics,
  DataSectionCart,
  DataSectionCosts,
  DataSectionPay,
  DataSectionReembolso,
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
  } = filterOrders(allOrders, date);

  useEffect(() => {
    if (data) {
      setUsersByDevice(data.usersByDevice);
      setAdSpends((prev) => ({
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
      setAdSpends((prev) => ({
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
  const totalAdSpend = useMemo(
    () => adSpends.google + adSpends.meta,
    [adSpends],
  );
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

  const roas = calculateRoas(
    parseCurrency(totalPaidAmountFormatted),
    totalAdSpend,
  );
  const roasQuadros = calculateRoas(totalQuadros, totalAdSpendQuadros);
  const roasEspelhos = calculateRoas(totalEspelhos, totalAdSpendEspelhos);

  const roasEcom = calculateRoas(totalPaidAllAmountEcom, totalAdSpendEcom);

  const roasLoja = calculateRoas(totalRevenue, totalAdSpendLoja);

  const roasChatbot = calculateRoas(
    parseCurrency(totalPaidAmountChatbotFormatted),
    totalAdSpendChatbot,
  );
  const roasMax = calculateRoas(
    parseCurrency(totalPaidAllAmountFormatted),
    totalAdSpend,
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

  const handleIsOpenPopup = () => {
    setIsPopupOpen(true);
  };
  const handleIsClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <Container>
      <Button
        variant="contained"
        color="primary"
        onClick={handleIsOpenPopup}
        style={{ marginBottom: '12px' }}
      >
        Analisar atrasos
      </Button>
      {store === 'outlet' ? (
        <DataSectionTPago
          title="Geral"
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
          title="Geral"
          bgcolor={bgColors.trafegoPago}
          verba={adSpends}
          totalOrdersFormatted={totalPaidAmountFormatted}
          roas={roas}
          roasEcom={roasEcom}
          roasLoja={roasLoja}
          roasChatbot={roasChatbot}
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
      <DataSectionReembolso
        bgcolor={bgColors.reembolso}
        totalAdSpend={totalAdSpend}
      />
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
          title="Sessões por dispositivo"
          usersByDevice={usersByDevice}
          loading={isLoadingADSGoogle}
        />
        <ChartStates
          title="Vendas por estado"
          orders={ordersToday}
          loading={isLoading}
        />
      </ContainerCharts>

      <ContainerCharts>
        <ChartLine
          title="Vendas por período"
          orders={ordersToday}
          loading={isLoading}
        />
      </ContainerCharts>
      <RefundPopup
        isPopupOpen={isPopupOpen}
        handleIsClosePopup={handleIsClosePopup}
      />
    </Container>
  );
}
