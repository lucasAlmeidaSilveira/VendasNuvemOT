import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { useOrders } from './OrdersContext';
import { formatDate } from '../tools/tools'

interface DataProps {
  totalVisits: string;
  usersByDevice: object;
  totalCost: string;
}

interface DataAnalyticsProps {
  data: DataProps;
  isLoading: boolean;
  error: string | null;
  resetData: () => void;
  fetchData: () => void;
}

interface AnalyticsProviderprops {
  children: ReactNode;
}

export const AnalyticsContext = createContext({} as DataAnalyticsProps);

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }: AnalyticsProviderprops) => {
  const [ data, setData] = useState<DataProps>({ totalVisits: '', usersByDevice: {}, totalCost: '' });
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const { store, date } = useOrders();

  // Função para buscar dados da API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const startDate = formatDate(date[0]); // Formata a data inicial 
      const endDate = formatDate(date[1]); // Formata a data final
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
  
  // Chamada da API quando 'date' ou 'store' mudam
  useEffect(() => {
    fetchData();
  }, [date, store]);

  const value = {
    data,
    isLoading,
    error,
    resetData: () => {
      setData({ totalVisits: '', usersByDevice: {}, totalCost: '' });
      setError(null);
    },
    fetchData
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
