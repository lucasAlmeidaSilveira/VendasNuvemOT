import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { TikTokAdsContextType, TotalCostTikTokProps } from '../types';
import { adjustDate } from '../tools/tools';
import { useOrders } from './OrdersContext';
import { env } from "../utils/env";

// Cria o contexto
const TikTokAdsContext = createContext<TikTokAdsContextType>({
  adsData: { totalCost: { all: 0 } }, // Valor padrão para adsData
  loading: false,
  error: null,
  fetchTikTokAds: () => {}, // Função vazia
  fetchTikTokCreatives: () => {}, // Função vazia
  allFullCreatives: [],
  totalCostTikTokAll: 0, // Valor padrão para totalCostTikTokAll
});

// Hook personalizado para usar o contexto
export const useTikTokAds = () => useContext(TikTokAdsContext);

// Provedor do contexto
export const TikTokAdsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [adsData, setAdsData] = useState<TotalCostTikTokProps>({
    totalCost: {
      all: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { store, date } = useOrders();
  const [totalCostTikTokAll, settotalCostTikTokAll] = useState<number>(0); // Estado para o valor de "all"
  const [allFullCreatives, setAllFullCreatives] = useState([]);

  const adjustDatePlus = (dateString: string): string => {
    // Converte a data para o formato YYYY-MM-DD (esperado pela API)
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const createdAtMin = adjustDatePlus(adjustDate(date[0]));
  const createdAtMax = adjustDatePlus(adjustDate(date[1]));

  // Função para buscar os dados do TikTok ADS
  const fetchTikTokAds = useCallback(async () => {
    const url = `${env.apiUrl}ads/tiktok/${store}/${createdAtMin}/${createdAtMax}`;
    if (!store || !date || date.length < 2) return; // Verifica se store e date são válidos

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do TikTok ADS');
      }

      const data = await response.json();
      setAdsData(data);

      // Extrai o valor de "all" e armazena no estado
      if (data && data.length > 0 && data[0].totalCost) {
        settotalCostTikTokAll(data[0].totalCost.all);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [store, date]);

  const fetchTikTokCreatives = useCallback(async () => {
    const url = `${env.apiUrl}creatives/tiktok/${store}/${createdAtMin}/${createdAtMax}`;
    if (!store || !date || date.length < 2) return; // Verifica se store e date são válidos

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do TikTok ADS');
      }

      const data = await response.json();
      setAdsData(data);

      // Extrai o valor de "all" e armazena no estado
      if (data && data.length > 0 && data[0].totalCost) {
        setAllFullCreatives(data[0].totalCost.dailyData);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [store, date]);

  // Busca os dados quando store ou date mudam
  useEffect(() => {
    fetchTikTokAds();
    fetchTikTokCreatives();
  }, [store, date]);

  // Valor do contexto
  const value = {
    adsData,
    loading,
    error,
    fetchTikTokAds,
    fetchTikTokCreatives,
    allFullCreatives,
    totalCostTikTokAll,
  };
  return (
    <TikTokAdsContext.Provider value={value}>
      {children}
    </TikTokAdsContext.Provider>
  );
};
