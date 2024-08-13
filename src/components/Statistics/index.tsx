import React, { useEffect, useState, useMemo } from 'react';
import { Container, ContainerCharts } from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine, ChartStates } from '../Chart';
import { parseCurrency } from '../../tools/tools';
import { DataSectionTPago } from './DataSectionTPago';
import { DataSectionAnalytics } from './DataSectionAnalytics';
import { DataSectionCart } from './DataSectionCart';
import { DataSectionCosts } from './DataSectionCosts';
import { DataSectionPay } from './DataSectionPay';

export function Statistics() {
  const {
    data,
    isLoading: isLoadingAnalytics,
    dataADSMeta,
    isLoadingADSMeta,
  } = useAnalytics();
  const { orders, isLoading: isLoadingOrders, date, store } = useOrders();
  const { paidOrders, totalPaidAmountFormatted, totalPaidAllAmountFormatted } =
    filterOrders(orders, date);
  const [usersByDevice, setUsersByDevice] = useState({});
  const [verbaGoogle, setVerbaGoogle] = useState(0);
  const [verbaMeta, setVerbaMeta] = useState(0);
  const [verbaGoogleEcom, setVerbaGoogleEcom] = useState(0);
  const [verbaMetaEcom, setVerbaMetaEcom] = useState(0);
  const [totalAdSpend, setTotalAdSpend] = useState(0);
  const [totalAdSpendEcom, setTotalAdSpendEcom] = useState(0);

  useEffect(() => {
    if (data) {
      setUsersByDevice(data.usersByDevice);
    }
  }, [date, data, dataADSMeta]);

  useEffect(() => {
    if (data) {
      setVerbaGoogle(parseFloat(data.totalCost));
      setVerbaGoogleEcom(parseFloat(data.totalCostEcom));
    }
  }, [date, data, isLoadingAnalytics]);

  useEffect(() => {
    if (dataADSMeta && dataADSMeta.length > 0) {
      const firstEntry = dataADSMeta[0];
      setVerbaMeta(parseFloat(firstEntry.spend));
      setVerbaMetaEcom(parseFloat(firstEntry.spendEcom));
    }
  }, [date, dataADSMeta, isLoadingADSMeta]);

  useEffect(() => {
    setTotalAdSpend(verbaGoogle + verbaMeta);
    setTotalAdSpendEcom(verbaGoogleEcom + verbaMetaEcom);
  }, [date, verbaGoogle, verbaMeta, verbaGoogleEcom, verbaMetaEcom]);

  const totalOrdersNumber = useMemo(
    () => parseCurrency(totalPaidAmountFormatted),
    [totalPaidAmountFormatted],
  );

  const totalOrdersAllNumber = useMemo(
    () => parseCurrency(totalPaidAllAmountFormatted),
    [totalPaidAllAmountFormatted],
  );

  const roas = useMemo(() => {
    return totalAdSpend > 0
      ? (totalOrdersNumber / totalAdSpend).toFixed(2)
      : '0.00';
  }, [totalOrdersNumber, totalAdSpend]);

  const roasMax = useMemo(() => {
    return totalAdSpend > 0
      ? (totalOrdersAllNumber / totalAdSpend).toFixed(2)
      : '0.00';
  }, [totalOrdersAllNumber, totalAdSpend]);

  const roasEcom = useMemo(() => {
    return totalAdSpendEcom > 0
      ? (totalOrdersNumber / totalAdSpendEcom).toFixed(2)
      : '0.00';
  }, [totalOrdersNumber, totalAdSpendEcom]);

  const roasMaxEcom = useMemo(() => {
    return totalAdSpendEcom > 0
      ? (totalOrdersAllNumber / totalAdSpendEcom).toFixed(2)
      : '0.00';
  }, [totalOrdersAllNumber, totalAdSpendEcom]);

  const bgColorTrafegoPago = '#525252';
  const bgColorCosts = '#978800';
  const bgColorAnalytics = '#006BC8';
  const bgColorConversaoVendas = '#592DEA';
  const bgColorPayment = '#008006';

  return (
    <Container>
      {store === 'artepropria' && (
        <DataSectionTPago
          title={'Tráfego Pago | Ecom'}
          bgcolor={bgColorTrafegoPago}
          verbaGoogle={verbaGoogleEcom}
          verbaMeta={verbaMetaEcom}
          totalAdSpend={totalAdSpendEcom}
          totalOrdersFormatted={totalPaidAmountFormatted}
          roas={roasEcom}
          roasMax={`Max.: ${roasMaxEcom}`}
          isLoadingADSGoogle={isLoadingAnalytics}
          isLoadingOrders={isLoadingOrders}
          isLoadingADSMeta={isLoadingADSMeta}
        />
      )}

      <DataSectionTPago
        title={'Tráfego Pago | Geral'}
        bgcolor={bgColorTrafegoPago}
        verbaGoogle={verbaGoogle}
        verbaMeta={verbaMeta}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalPaidAmountFormatted}
        roas={roas}
        roasMax={`Max.: ${roasMax}`}
        isLoadingADSGoogle={isLoadingAnalytics}
        isLoadingOrders={isLoadingOrders}
        isLoadingADSMeta={isLoadingADSMeta}
      />

      <DataSectionAnalytics
        bgcolor={bgColorAnalytics}
        totalAdSpend={totalAdSpend}
      />
      <DataSectionPay bgcolor={bgColorPayment} />
      <DataSectionCosts
        bgcolor={bgColorCosts}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalPaidAmountFormatted}
        isLoadingADSGoogle={isLoadingAnalytics}
        isLoadingADSMeta={isLoadingADSMeta}
      />
      <DataSectionCart
        bgcolor={bgColorConversaoVendas}
        totalAdSpend={totalAdSpend}
      />
      <ContainerCharts>
        <Chart
          title={'Sessões por dispositivo'}
          usersByDevice={usersByDevice}
          loading={isLoadingAnalytics}
        />
        <ChartStates
          title={'Vendas por estado'}
          orders={paidOrders}
          loading={isLoadingOrders}
        />
      </ContainerCharts>
      <ContainerCharts>
        <ChartLine
          title={'Vendas por '}
          orders={paidOrders}
          loading={isLoadingOrders}
        />
      </ContainerCharts>
    </Container>
  );
}
