import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  ContainerOrders,
  ContainerGeral,
  ContainerCharts,
} from './styles';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FcGoogle } from 'react-icons/fc';
import { FaMeta } from 'react-icons/fa6';
import { GrMoney } from 'react-icons/gr';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { DiGoogleAnalytics } from 'react-icons/di';
import { Loading } from '../Loading';
import { FilterDate } from '../FilterDate';
import { filterOrders } from '../../tools/filterOrders';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { Chart, ChartLine } from '../Chart';
import { formatCurrency, parseCurrency } from '../../tools/tools';
import { BudgetItem } from './BudgetItem';
import { DataSectionTPago } from './DataSectionTPago';
import { DataSectionAnalytics } from './DataSectionAnalytics';
import { DataSectionCart } from "./DataSectionCart";

export function Statistics() {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { store, orders, isLoading: isLoadingOrders, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted } = filterOrders(orders, date);
  const [ usersByDevice, setUsersByDevice ] = useState({});
  const [ visits, setVisits ] = useState('0');
  const [ verbaGoogle, setVerbaGoogle ] = useState(0);
  const [ verbaMeta, setVerbaMeta ] = useState(0);
  const [ totalAdSpend, setTotalAdSpend ] = useState(0);

  useEffect(() => {
    setVisits(parseInt(data.totalVisits).toLocaleString('pt-BR'));
    setUsersByDevice(data.usersByDevice);
    setTotalAdSpend(verbaGoogle + verbaMeta);
  }, [data, store]); // Correção para dependências corretas

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
      {/* <DataSectionTPago
        bgcolor={bgColorTrafegoPago}
        verbaGoogle={verbaGoogle}
        verbaMeta={verbaMeta}
        totalAdSpend={totalAdSpend}
        totalOrdersFormatted={totalOrdersFormatted}
        roas={roas}
        isLoadingOrders={isLoadingOrders}
        isLoadingAnalytics={isLoadingAnalytics}
      /> */}
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
          title={'Compras por hora'}
          orders={orders}
          loading={isLoadingOrders}
        />
        {/* <Chart title={'Sessões por dispositivo'} usersByDevice={usersByDevice}  /> */}
      </ContainerCharts>
    </Container>
  );
}
