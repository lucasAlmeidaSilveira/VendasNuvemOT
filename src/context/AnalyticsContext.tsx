import React, {
  ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import { useOrders } from './OrdersContext';
import { formatDate } from '../tools/tools';
import { useTab } from './TabContext';
import { useAuth } from './AuthContext';
import {
  ADSMetaEntry,
  AnalyticsProviderProps,
  DataAnalyticsProps,
  DataProps,
} from '../types';

export const AnalyticsContext = createContext({} as DataAnalyticsProps);

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<DataProps>({
    totalVisits: 0,
    usersByDevice: { mobile: 0, desktop: 0, tablet: 0 },
    totalCost: {
      all: 0,
      ecom: 0,
      quadros: 0,
      espelhos: 0,
      loja: 0,
      chatbot: 0,
      geral: 0,
    },
    carts: 0,
    beginCheckout: 0,
  });
  const [isLoadingADSGoogle, setIsLoadingADSGoogle] = useState<boolean>(false);
  const [isLoadingADSMeta, setIsLoadingADSMeta] = useState<boolean>(false);
  const [dataADSMeta, setDataADSMeta] = useState<ADSMetaEntry[]>([]);
  const [errorGoogle, setErrorGoogle] = useState<boolean>(false);
  const [errorMeta, setErrorMeta] = useState<boolean>(false);
  const { store, date, allOrders } = useOrders();
  const { user } = useAuth();
  const { activeTab } = useTab();

  const startDate = formatDate(date[0]);
  const endDate = formatDate(date[1]);

  const fetchDataGoogle = async (): Promise<void> => {
    try {
      setIsLoadingADSGoogle(true);
      const response = await fetch(
        `https://node-vendasnuvemot.onrender.com/analytics/${store}/${startDate}/${endDate}`,
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }
      const data = await response.json();
      setData(data);
      setErrorGoogle(false);
    } catch (err: any) {
      setErrorGoogle(true);
    } finally {
      setIsLoadingADSGoogle(false);
    }
  };

  const fetchDataADSMeta = async (): Promise<void> => {
    try {
      setIsLoadingADSMeta(true);
      const response = await fetch(
        `https://node-vendasnuvemot.onrender.com/ads/meta/${store}/${startDate}/${endDate}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDataADSMeta(data);
      setErrorMeta(false);
    } catch (error: any) {
      setErrorMeta(true);
    } finally {
      setIsLoadingADSMeta(false);
    }
  };

  useEffect(() => {
    if(activeTab === 2) {
      fetchDataGoogle();
      fetchDataADSMeta();
    }
  }, [allOrders, store, user, activeTab]);

  const resetData = (): void => {
    setData({
      totalVisits: 0,
      usersByDevice: { mobile: 0, desktop: 0, tablet: 0 },
      totalCost: {
        all: 0,
        ecom: 0,
        quadros: 0,
        espelhos: 0,
        chatbot: 0,
        loja: 0,
        geral: 0,
      },
      carts: 0,
      beginCheckout: 0,
    });
    setDataADSMeta([]);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        dataADSMeta,
        isLoadingADSGoogle,
        isLoadingADSMeta,
        errorGoogle,
        errorMeta,
        resetData,
        fetchDataGoogle,
        fetchDataADSMeta,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
