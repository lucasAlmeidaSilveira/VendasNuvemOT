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
  DataSectionTPago,
  DataSectionTPagoAP,
} from './Sections';
import { calculateRoas, parseCurrency } from '../../tools/tools';
import { Container, ContainerCharts } from './styles';

export function Statistics() {
  const { data, dataADSMeta, isLoadingADSGoogle, isLoadingADSMeta } =
    useAnalytics();
  const { allOrders, isLoading, date, store } = useOrders();

  const [usersByDevice, setUsersByDevice] = useState({});
  const [adSpends, setAdSpends] = useState({
    google: 0,
    googleEcom: 0,
    googleQuadros: 0,
    googleEspelhos: 0,
    googleGeral: 0,
    meta: 0,
    metaEcom: 0,
    metaQuadros: 0,
    metaEspelhos: 0,
    metaGeral: 0,
  });

  // Filtros para pedidos
  const {
    ordersToday,
    totalPaidAmountFormatted,
    totalPaidAllAmountFormatted,
    totalPaidAllAmountEcomFormatted,
    totalPaidAmountChatbotFormatted,
    totalPaidAmountEcomFormatted,
    totalEspelhosFormatted,
    totalQuadrosFormatted,
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
        googleGeral: data.totalCost.geral,
      }));
    }
    if (dataADSMeta?.length > 0) {
      const firstEntry = dataADSMeta[0];
      setAdSpends(prev => ({
        ...prev,
        meta: firstEntry.totalCost.all,
        metaEcom: firstEntry.totalCost.ecom,
        metaQuadros: firstEntry.totalCost.quadros,
        metaEspelhos: firstEntry.totalCost.espelhos,
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

  const roas = calculateRoas(
    parseCurrency(totalPaidAmountFormatted),
    totalAdSpend,
  );
  const roasMax = calculateRoas(
    parseCurrency(totalPaidAllAmountFormatted),
    totalAdSpend,
  );

  const roasEcom = calculateRoas(
    parseCurrency(totalPaidAmountEcomFormatted),
    totalAdSpendEcom,
  );
  const roasMaxEcom = calculateRoas(
    parseCurrency(totalPaidAllAmountEcomFormatted),
    totalAdSpendEcom,
  );

  const roasChatbot = calculateRoas(
    parseCurrency(totalPaidAmountChatbotFormatted),
    totalAdSpend,
  );

  // Cores de fundo para diferentes seções
  const bgColors = {
    trafegoPago: '#525252',
    costs: '#978800',
    analytics: '#006BC8',
    conversaoVendas: '#592DEA',
    payment: '#008006',
  };

  return (
    <Container>
      {store === 'artepropria' ? (
        <DataSectionTPagoAP
          title='Tráfego Pago | Geral'
          bgcolor={bgColors.trafegoPago}
          verbaGoogle={adSpends.google}
          verbaMeta={adSpends.meta}
          totalAdSpend={totalAdSpend}
          totalOrdersFormatted={totalPaidAmountFormatted}
          roas={roas}
          roasMax={`Max.: ${roasMax}`}
          isLoadingADSGoogle={isLoadingADSGoogle}
          isLoadingOrders={isLoading}
          isLoadingADSMeta={isLoadingADSMeta}
        />
      ) : (
        <DataSectionTPago
          title='Geral'
          bgcolor={bgColors.trafegoPago}
          verba={adSpends}
          totalOrdersFormatted={totalPaidAmountFormatted}
          roas={roas}
          roasMax={roasMax}
          isLoadingADSGoogle={isLoadingADSGoogle}
          isLoadingOrders={isLoading}
          isLoadingADSMeta={isLoadingADSMeta}
        />
      )}

      {store === 'artepropria' && (
        <>
          <DataSectionTPagoAP
            title='Tráfego Pago | Ecom'
            bgcolor={bgColors.trafegoPago}
            verbaGoogle={adSpends.googleEcom}
            verbaMeta={adSpends.metaEcom}
            totalAdSpend={totalAdSpendEcom}
            totalOrdersFormatted={totalPaidAmountEcomFormatted}
            roas={roasEcom}
            roasMax={`Max.: ${roasMaxEcom}`}
            isLoadingADSGoogle={isLoadingADSGoogle}
            isLoadingOrders={isLoading}
            isLoadingADSMeta={isLoadingADSMeta}
          />
          <DataSectionTPagoAP
            title='Tráfego Pago | Chatbot'
            bgcolor={bgColors.trafegoPago}
            verbaGoogle={adSpends.google}
            verbaMeta={adSpends.meta}
            totalAdSpend={totalAdSpend}
            totalOrdersFormatted={totalPaidAmountChatbotFormatted}
            roas={roasChatbot}
            isLoadingADSGoogle={isLoadingADSGoogle}
            isLoadingOrders={isLoading}
            isLoadingADSMeta={isLoadingADSMeta}
          />
        </>
      )}

      <DataSectionAnalytics
        bgcolor={bgColors.analytics}
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
    </Container>
  );
}
