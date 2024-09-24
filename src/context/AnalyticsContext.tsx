import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { useOrders } from './OrdersContext';
import { formatDate } from '../tools/tools';
import { useTab } from "./TabContext";
import { useAuth } from "./AuthContext";

interface ADSMetaEntry {
  account_id: string;
  spend: string;
  spendEcom: string;
  impressions: number;
}

interface DataProps {
  totalCostEcom: string;
  totalVisits: string;
  usersByDevice: object;
  totalCost: string;
  carts: string;
  beginCheckout: string;
}

interface DataAnalyticsProps {
  data: DataProps;
  dataADSMeta: Array<ADSMetaEntry>;
  isLoadingADSGoogle: boolean;
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
  const [data, setData] = useState<DataProps>({ totalVisits: '', usersByDevice: {}, totalCost: '', carts: '', beginCheckout: '', totalCostEcom: '' });
  const [isLoadingADSGoogle, setIsLoadingADSGoogle] = useState(false);
  const [isLoadingADSMeta, setIsLoadingADSMeta] = useState(false); // Estado de loading adicionado
  const [dataADSMeta, setDataADSMeta] = useState<Array<ADSMetaEntry>>([]); // Estado para dados ADS Meta
  const [error, setError] = useState<string | null>(null);
  const { store, date } = useOrders();
  const { user } = useAuth()
  const { activeTab } = useTab()

  const startDate = formatDate(date[0]);
  const endDate = formatDate(date[1]);

  // Função para buscar dados do Google Analytics e ADS
  const fetchDataGoogle = async () => {
    try {
      setIsLoadingADSGoogle(true);
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/analytics/${store}/${startDate}/${endDate}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }
      const data = await response.json();
      setData(data);
      setIsLoadingADSGoogle(false);
    } catch (err) {
      setError('Falha ao carregar os dados: ' + err.message);
    }
  };

  // Função para buscar dados ADS Meta
  const fetchDataADSMeta = async () => {
    try {
      setIsLoadingADSMeta(true);
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/ads/meta/${store}/${startDate}/${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDataADSMeta(data);
      setIsLoadingADSMeta(false);
    } catch (error) {
      setError('Falha ao carregar os dados ADS Meta: ' + error.message);
    } finally {
    }
  };

  // Chamada da API quando 'date' ou 'store' mudam
  useEffect(() => {
    if(user) {
      if(activeTab === 2) {
        fetchDataGoogle();
        fetchDataADSMeta();
      }
    }
  }, [date, store, activeTab, user]);

  const value = {
    data,
    dataADSMeta,
    isLoadingADSGoogle,
    isLoadingADSMeta,
    error,
    resetData: () => {
      setData({ totalVisits: '', usersByDevice: {}, totalCost: '', totalCostEcom: '', carts: '', beginCheckout: '' });
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
