import React, { useEffect, useState, useMemo } from 'react';
import { Container, ContainerCharts } from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine, ChartStates } from '../Chart';
import { formatCurrency, parseCurrency } from '../../tools/tools';
import { DataSectionTPago } from './DataSectionTPago';
import { DataSectionAnalytics } from './DataSectionAnalytics';
import { DataSectionCart } from './DataSectionCart';
import { DataSectionCosts } from './DataSectionCosts';

export function Statistics() {
  const { data, isLoading: isLoadingAnalytics, dataADSMeta, isLoadingADSMeta } = useAnalytics();
  const { orders, isLoading: isLoadingOrders, date } = useOrders();
  const { paidOrders, totalOrdersFormatted, totalPaidAmountFormatted } =
    filterOrders(orders, date);
  const [usersByDevice, setUsersByDevice] = useState({});
  const [verbaGoogle, setVerbaGoogle] = useState(0);
  const [verbaMeta, setVerbaMeta] = useState(0);
  const [totalAdSpend, setTotalAdSpend] = useState(0);

  useEffect(() => {
    if (data) {
      setUsersByDevice(data.usersByDevice);
    }
  }, [date, data, dataADSMeta]);

  useEffect(() => {
    if (data) {
      setVerbaGoogle(parseFloat(data.totalCost));
    }
  }, [date, data, isLoadingAnalytics]);

  useEffect(() => {
    async function fetchDataADSMeta() {
      try {
        if (dataADSMeta && dataADSMeta.length > 0) {
          const firstEntry = dataADSMeta[0];
          setVerbaMeta(parseFloat(firstEntry.spend)); // Exibirá o primeiro objeto do array dataADSMeta
        }
      } catch (error) {
        console.error('Erro ao buscar dados do ADS Meta:', error);
      }
    }

    fetchDataADSMeta();
  }, [date, dataADSMeta, isLoadingADSMeta]);

  useEffect(() => {
    setTotalAdSpend(verbaGoogle + verbaMeta);
  }, [date, verbaGoogle, verbaMeta]);

  const totalOrdersNumber = useMemo(
    () => parseCurrency(totalPaidAmountFormatted),
    [totalPaidAmountFormatted],
  );

  const roas = useMemo(() => {
    return totalAdSpend > 0
      ? (totalOrdersNumber / totalAdSpend).toFixed(2)
      : '0.00';
  }, [totalOrdersNumber, totalAdSpend]);

  const bgColorTrafegoPago = '#525252';
  const bgColorCosts = '#978800';
  const bgColorAnalytics = '#006BC8';
  const bgColorConversaoVendas = '#592DEA';

  return (
    <Container>
      <DataSectionTPago
        bgcolor={bgColorTrafegoPago}
        verbaGoogle={verbaGoogle}
        verbaMeta={verbaMeta}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalPaidAmountFormatted}
        roas={roas}
        isLoadingADSGoogle={isLoadingAnalytics}
        isLoadingOrders={isLoadingOrders}
        isLoadingADSMeta={isLoadingADSMeta}
      />
      <DataSectionAnalytics
        bgcolor={bgColorAnalytics}
        totalAdSpend={totalAdSpend}
      />
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
