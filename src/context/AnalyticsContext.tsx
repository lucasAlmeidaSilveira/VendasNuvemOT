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
  AdsRow,
  AnalyticsProviderProps,
  DataAnalyticsProps,
  DataProps,
  DatabaseTable,
} from '../types';
import { fetchTable } from '../api/db';

export const AnalyticsContext = createContext({} as DataAnalyticsProps);

export const useAnalytics = () => useContext(AnalyticsContext);

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// Linhas Google da tabela `ads` → DataProps (sessões/dispositivos/carrinhos/
// checkout + verba Google). Soma o período (uma linha por dia).
const buildGoogleData = (rows: AdsRow[]): DataProps => {
  const data: DataProps = {
    totalVisits: 0,
    usersByDevice: { mobile: 0, desktop: 0, tablet: 0 },
    totalCost: { all: 0, ecom: 0, quadros: 0, espelhos: 0, loja: 0, chatbot: 0, geral: 0 },
    carts: 0,
    beginCheckout: 0,
  };
  for (const r of rows) {
    data.totalVisits += num(r.total_visits);
    data.carts += num(r.carts);
    data.beginCheckout += num(r.begin_checkout);
    const ubd = r.users_by_device || { mobile: 0, desktop: 0, tablet: 0 };
    data.usersByDevice.mobile += num(ubd.mobile);
    data.usersByDevice.desktop += num(ubd.desktop);
    data.usersByDevice.tablet += num(ubd.tablet);
    data.totalCost.all += num(r.funding_all);
    data.totalCost.ecom += num(r.funding_ecom);
    data.totalCost.quadros += num(r.funding_painting);
    data.totalCost.espelhos += num(r.funding_mirror);
    data.totalCost.loja += num(r.funding_store);
    data.totalCost.geral += num(r.funding_general);
    data.totalCost.chatbot += num(r.funding_chatbot);
  }
  return data;
};

// Linhas Meta da tabela `ads` → ADSMetaEntry[] (verba Meta + impressões).
const buildMetaData = (rows: AdsRow[]): ADSMetaEntry[] => {
  const totalCost = {
    all: 0, ecom: 0, quadros: 0, espelhos: 0, instagram: 0, chatbot: 0, geral: 0,
  };
  let impressions = 0;
  for (const r of rows) {
    totalCost.all += num(r.funding_all);
    totalCost.ecom += num(r.funding_ecom);
    totalCost.quadros += num(r.funding_painting);
    totalCost.espelhos += num(r.funding_mirror);
    totalCost.instagram += num(r.funding_insta);
    totalCost.chatbot += num(r.funding_chatbot);
    totalCost.geral += num(r.funding_general);
    impressions += num(r.impressions);
  }
  return [{ account_id: 'meta', totalCost, impressions }];
};

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
  const { store, date } = useOrders();
  const { user } = useAuth();
  const { activeTab } = useTab();

  const startDate = formatDate(date[0]);
  const endDate = formatDate(date[1]);

  // Busca a verba/analytics da tabela `ads` do novo backend e monta `data`
  // (linhas Google: sessões/dispositivos/carrinhos/checkout + verba Google) e
  // `dataADSMeta` (linhas Meta: verba + impressões) numa única chamada.
  const loadAds = async (): Promise<void> => {
    try {
      setIsLoadingADSGoogle(true);
      setIsLoadingADSMeta(true);
      const rows = await fetchTable<AdsRow>(DatabaseTable.ADS, {
        store,
        startDate,
        endDate,
      });
      const google = rows.filter(
        (r) => String(r.plataform).toLowerCase() === 'google',
      );
      const meta = rows.filter(
        (r) => String(r.plataform).toLowerCase() === 'meta',
      );
      setData(buildGoogleData(google));
      setDataADSMeta(buildMetaData(meta));
      setErrorGoogle(false);
      setErrorMeta(false);
    } catch (err: any) {
      setErrorGoogle(true);
      setErrorMeta(true);
    } finally {
      setIsLoadingADSGoogle(false);
      setIsLoadingADSMeta(false);
    }
  };

  // Mantidos para compatibilidade (ButtonReload chama ambos); ambos recarregam
  // a tabela `ads` (Google + Meta) na nova base.
  const fetchDataGoogle = loadAds;
  const fetchDataADSMeta = loadAds;

  useEffect(() => {
    if (activeTab === 2) {
      loadAds();
    }
  }, [store, user, activeTab, date]);

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
