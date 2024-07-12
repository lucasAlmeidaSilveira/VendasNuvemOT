import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { useOrders } from './OrdersContext';
import { formatDate } from '../tools/tools';

interface ADSMetaEntry {
  account_id: string;
  spend: string;
  impressions: number;
  // Adicione outras propriedades, se necessário
}

interface DataProps {
  totalVisits: string;
  usersByDevice: object;
  totalCost: string;
  carts: string;
  beginCheckout: string;
}

interface DataAnalyticsProps {
  data: DataProps;
  dataADSMeta: Array<ADSMetaEntry>;
  isLoading: boolean;
  isLoadingADSMeta: boolean;
  error: string | null;
  resetData: () => void;
  fetchDataGoogle: () => void;
  fetchDataADSMeta: () => void;
}

interface AnalyticsProviderprops {
  children: ReactNode;
}

export const AnalyticsContext = createContext({} as DataAnalyticsProps);

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }: AnalyticsProviderprops) => {
  const [data, setData] = useState<DataProps>({ totalVisits: '', usersByDevice: {}, totalCost: '', carts: '', beginCheckout: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingADSMeta, setIsLoadingADSMeta] = useState(false); // Estado de loading adicionado
  const [dataADSMeta, setDataADSMeta] = useState<Array<ADSMetaEntry>>([]); // Estado para dados ADS Meta
  const [error, setError] = useState<string | null>(null);
  const { store, date } = useOrders();

  const startDate = formatDate(date[0]);
  const endDate = formatDate(date[1]);

  // Função para buscar dados do Google Analytics e ADS
  const fetchDataGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/analytics/${store}/${startDate}/${endDate}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError('Falha ao carregar os dados: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados ADS Meta
  const fetchDataADSMeta = async () => {
    setIsLoadingADSMeta(true);
    try {
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/ads/meta/${store}/${startDate}/${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDataADSMeta(data);
    } catch (error) {
      setError('Falha ao carregar os dados ADS Meta: ' + error.message);
    } finally {
      setIsLoadingADSMeta(false);
    }
  };

  // Chamada da API quando 'date' ou 'store' mudam
  useEffect(() => {
    fetchDataGoogle();
    fetchDataADSMeta();
  }, [date, store]);

  const value = {
    data,
    dataADSMeta,
    isLoading,
    isLoadingADSMeta,
    error,
    resetData: () => {
      setData({ totalVisits: '', usersByDevice: {}, totalCost: '', carts: '', beginCheckout: '' });
      setDataADSMeta([]);
      setError(null);
    },
    fetchDataGoogle,
    fetchDataADSMeta
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
