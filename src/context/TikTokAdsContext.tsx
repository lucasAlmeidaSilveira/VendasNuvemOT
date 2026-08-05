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
import { useTab } from './TabContext';
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
  const { activeTab } = useTab();
  const [totalCostTikTokAll, settotalCostTikTokAll] = useState<number>(0); // Estado para o valor de "all"
  const [allFullCreatives, setAllFullCreatives] = useState([]);

  const adjustDatePlus = (dateString: string): string => {
    // Converte a data para o formato YYYY-MM-DD (esperado pela API)
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const createdAtMin = adjustDatePlus(adjustDate(date[0]));
  const createdAtMax = adjustDatePlus(adjustDate(date[1]));

  // Cada busca tem o SEU loading: antes as duas compartilhavam um só, e a que
  // terminasse primeiro já marcava tudo como carregado enquanto a outra ainda
  // estava em voo.
  const [loadingCreatives, setLoadingCreatives] = useState(false);

  // Função para buscar os dados do TikTok ADS
  const fetchTikTokAds = useCallback(async () => {
    const url = `${env.apiUrl}ads/tiktok/${store}/${createdAtMin}/${createdAtMax}`;
    if (!store || !date || date.length < 2) return; // Verifica se store e date são válidos

    setLoading(true);
    setError(null);
    // Zera o gasto do período ANTERIOR antes de buscar o novo. Sem isto, o
    // `settotalCostTikTokAll` só rodava dentro do `if` abaixo — então um período
    // sem gasto no TikTok herdava o valor do período anterior, que entrava em
    // Verba Total, ROAS, CPS, CPA, Custo ADS e Margem de Contribuição.
    settotalCostTikTokAll(0);

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

    setLoadingCreatives(true);
    setError(null);
    // Mesmo motivo do totalCostTikTokAll: sem reset, os criativos do período
    // anterior continuavam listados quando o novo período não tinha nenhum.
    setAllFullCreatives([]);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do TikTok ADS');
      }

      const data = await response.json();
      // NÃO escreve em `adsData`: esta é a resposta de CRIATIVOS. As duas
      // buscas gravavam no mesmo estado e disputavam quem chegava por último.
      if (data && data.length > 0 && data[0].totalCost) {
        setAllFullCreatives(data[0].totalCost.dailyData);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingCreatives(false);
    }
  }, [store, date]);

  // Busca os dados quando store ou date mudam — só na aba Estatísticas (2),
  // única que consome estes dados. Antes rodava em qualquer aba, gastando duas
  // requisições a cada troca de período mesmo no Dashboard ou em Pedidos.
  useEffect(() => {
    if (activeTab !== 2) return;
    fetchTikTokAds();
    fetchTikTokCreatives();
  }, [store, date, activeTab]);

  // Valor do contexto. `loading` continua sendo verdadeiro enquanto QUALQUER
  // uma das duas buscas estiver em voo.
  const value = {
    adsData,
    loading: loading || loadingCreatives,
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
