import React, { useEffect, useState, useMemo } from 'react';
import { Container, ContainerCharts } from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FilterDate } from '../FilterDate';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine } from '../Chart';
import { formatCurrency, parseCurrency } from '../../tools/tools';
import { DataSectionTPago } from './DataSectionTPago';
import { DataSectionAnalytics } from './DataSectionAnalytics';
import { DataSectionCart } from './DataSectionCart';
import { useDataADSMeta } from '../../hooks/useDataADSMeta';

export function Statistics() {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const {
    store,
    orders,
    isLoading: isLoadingOrders,
    date,
    setDate,
  } = useOrders();
  const { dataADSMeta, isLoadingADSMeta } = useDataADSMeta({ store, date });
  const { ordersToday, totalOrdersFormatted } = filterOrders(orders, date);
  const [ usersByDevice, setUsersByDevice ] = useState({});
  const [ verbaGoogle, setVerbaGoogle ] = useState(0);
  const [ verbaMeta, setVerbaMeta ] = useState(0);
  const [ totalAdSpend, setTotalAdSpend ] = useState(0);

  useEffect(() => {
    if (data) {
      setUsersByDevice(data.usersByDevice);
    }
  }, [data]);

  useEffect(() => {
    if(data) {
      setVerbaGoogle(parseFloat(data.totalCost))
    }
  }, [data, isLoadingAnalytics])

  useEffect(() => {
    async function fetchDataADSMeta() {
      try {
        // Aguarde a resolução da promessa retornada por useDataADSMeta
        if (dataADSMeta && dataADSMeta.length > 0) {
          const firstEntry = dataADSMeta[0];
          setVerbaMeta(parseFloat(firstEntry.spend)); // Exibirá o primeiro objeto do array dataADSMeta
        }
      } catch (error) {
        console.error('Erro ao buscar dados do ADS Meta:', error);
      }
    }

    fetchDataADSMeta();
  }, [dataADSMeta, isLoadingADSMeta]);

  useEffect(() => {
    setTotalAdSpend(verbaGoogle + verbaMeta);
  }, [verbaGoogle, verbaMeta]);

  const totalOrdersNumber = useMemo(
    () => parseCurrency(totalOrdersFormatted),
    [totalOrdersFormatted],
  );

  const roas = useMemo(() => {
    return totalAdSpend > 0
      ? (totalOrdersNumber / totalAdSpend).toFixed(2)
      : '0.00';
  }, [totalOrdersNumber, totalAdSpend]);

  const bgColorTrafegoPago = '#525252';
  const bgColorAnalytics = '#006BC8';
  const bgColorConversaoVendas = '#592DEA';

  return (
    <Container>
      <FilterDate onChange={setDate} value={date} />
      <DataSectionTPago
        bgcolor={bgColorTrafegoPago}
        verbaGoogle={verbaGoogle}
        verbaMeta={verbaMeta}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalOrdersFormatted}
        roas={roas}
        isLoadingADSGoogle={isLoadingAnalytics}
        isLoadingOrders={isLoadingOrders}
        isLoadingADSMeta={isLoadingADSMeta}
      />
      <DataSectionAnalytics
        bgcolor={bgColorAnalytics}
        totalAdSpend={totalAdSpend}
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
        <ChartLine
          title={'Vendas por hora'}
          orders={ordersToday}
          loading={isLoadingOrders}
        />
        {/* <Chart title={'Sessões por dispositivo'} usersByDevice={usersByDevice}  /> */}
      </ContainerCharts>
    </Container>
  );
}
