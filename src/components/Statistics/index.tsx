import React, { useEffect, useState, useMemo } from 'react';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine, ChartStates } from '../Chart';
import { DataSectionAnalytics, DataSectionCart, DataSectionCosts, DataSectionPay, DataSectionTPago } from "./Sections"; 
import { calculateRoas, parseCurrency } from '../../tools/tools';
import { Container, ContainerCharts } from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

export function Statistics() {
  const { data, dataADSMeta, isLoadingADSGoogle, isLoadingADSMeta } = useAnalytics();
  const { allOrders, isLoading, date, store } = useOrders();
  const [usersByDevice, setUsersByDevice] = useState({});
  const [adSpends, setAdSpends] = useState({
    google: 0,
    meta: 0,
    googleEcom: 0,
    metaEcom: 0,
  });

  const { ordersToday, totalPaidAmountFormatted, totalPaidAllAmountFormatted, totalPaidAmountChatbotFormatted } = 
    filterOrders(allOrders, date);

  // Set users by device
  useEffect(() => {
    if (data) setUsersByDevice(data.usersByDevice);
  }, [data]);

  // Set ad spend data
  useEffect(() => {
    if (data) {
      setAdSpends(prev => ({
        ...prev,
        google: parseFloat(data.totalCost),
        googleEcom: parseFloat(data.totalCostEcom),
      }));
    }
    if (dataADSMeta && dataADSMeta.length > 0) {
      const firstEntry = dataADSMeta[0];
      setAdSpends(prev => ({
        ...prev,
        meta: parseFloat(firstEntry.spend),
        metaEcom: parseFloat(firstEntry.spendEcom),
      }));
    }
  }, [data, dataADSMeta]);

  // Total ad spend
  const totalAdSpend = useMemo(() => adSpends.google + adSpends.meta, [adSpends]);
  const totalAdSpendEcom = useMemo(() => adSpends.googleEcom + adSpends.metaEcom, [adSpends]);

  // ROAS calculations
  const totalOrdersNumber = useMemo(() => parseCurrency(totalPaidAmountFormatted), [totalPaidAmountFormatted]);
  const totalOrdersAllNumber = useMemo(() => parseCurrency(totalPaidAllAmountFormatted), [totalPaidAllAmountFormatted]);
  const totalOrdersAllChatbotNumber = useMemo(() => parseCurrency(totalPaidAmountChatbotFormatted), [totalPaidAmountChatbotFormatted]);

  const roas = useMemo(() => calculateRoas(totalOrdersNumber, totalAdSpend), [totalOrdersNumber, totalAdSpend]);
  const roasMax = useMemo(() => calculateRoas(totalOrdersAllNumber, totalAdSpend), [totalOrdersAllNumber, totalAdSpend]);
  const roasEcom = useMemo(() => calculateRoas(totalOrdersNumber, totalAdSpendEcom), [totalOrdersNumber, totalAdSpendEcom]);
  const roasMaxEcom = useMemo(() => calculateRoas(totalOrdersAllNumber, totalAdSpendEcom), [totalOrdersAllNumber, totalAdSpendEcom]);
  const roasChatbot = useMemo(() => calculateRoas(totalOrdersAllChatbotNumber, totalAdSpend), [totalOrdersAllChatbotNumber, totalAdSpend]);
  const roasMaxChatbot = useMemo(() => calculateRoas(totalOrdersAllChatbotNumber, totalAdSpend), [totalOrdersAllChatbotNumber, totalAdSpend]);

  const bgColors = {
    trafegoPago: '#525252',
    costs: '#978800',
    analytics: '#006BC8',
    conversaoVendas: '#592DEA',
    payment: '#008006',
  };

  return (
    <Container>
      <DataSectionTPago
        title="Tráfego Pago | Geral"
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
      {store === 'artepropria' && (
        <>
          <DataSectionTPago
            title="Tráfego Pago | Ecom"
            bgcolor={bgColors.trafegoPago}
            verbaGoogle={adSpends.googleEcom}
            verbaMeta={adSpends.metaEcom}
            totalAdSpend={totalAdSpendEcom}
            totalOrdersFormatted={totalPaidAmountFormatted}
            roas={roasEcom}
            roasMax={`Max.: ${roasMaxEcom}`}
            isLoadingADSGoogle={isLoadingADSGoogle}
            isLoadingOrders={isLoading}
            isLoadingADSMeta={isLoadingADSMeta}
          />
          <DataSectionTPago
            title="Tráfego Pago | Chatbot"
            bgcolor={bgColors.trafegoPago}
            verbaGoogle={adSpends.google}
            verbaMeta={adSpends.meta}
            totalAdSpend={totalAdSpend}
            totalOrdersFormatted={totalPaidAmountChatbotFormatted}
            roas={roasChatbot}
            roasMax={`Max.: ${roasMaxChatbot}`}
            isLoadingADSGoogle={isLoadingADSGoogle}
            isLoadingOrders={isLoading}
            isLoadingADSMeta={isLoadingADSMeta}
          />
        </>
      )}

      <DataSectionAnalytics bgcolor={bgColors.analytics} totalAdSpend={totalAdSpend} />
      <DataSectionPay bgcolor={bgColors.payment} />
      <DataSectionCosts
        bgcolor={bgColors.costs}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalPaidAmountFormatted}
        isLoadingADSGoogle={isLoadingADSGoogle}
        isLoadingADSMeta={isLoadingADSMeta}
      />
      <DataSectionCart bgcolor={bgColors.conversaoVendas} totalAdSpend={totalAdSpend} />

      <ContainerCharts>
        <Chart title="Sessões por dispositivo" usersByDevice={usersByDevice} loading={isLoadingADSGoogle} />
        <ChartStates title="Vendas por estado" orders={ordersToday} loading={isLoading} />
      </ContainerCharts>

      <ContainerCharts>
        <ChartLine title="Vendas por período" orders={ordersToday} loading={isLoading} />
      </ContainerCharts>
    </Container>
  );
}
