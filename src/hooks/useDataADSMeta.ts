import { useState, useEffect } from 'react';
import { formatDate } from "../tools/tools";
import { useOrders } from "../context/OrdersContext";

interface ADSMetaEntry {
  account_id: string;
  date_start: string;
  date_stop: string;
  impressions: string;
  spend: string;
  // Adicione outras propriedades, se necessário
}

interface useDataADSMetaProps {
  store: string;
}

export function useDataADSMeta({ store }: useDataADSMetaProps) {
  const [ dataADSMeta, setDataADSMeta ] = useState<Array<ADSMetaEntry>>([]);
  const { date, setDate } = useOrders();
  const [ isLoadingADSMeta, setIsLoadingADSMeta ] = useState(false); // Estado de loading adicionado

  const startDate = formatDate(date[0]);
  const endDate = formatDate(date[1]);

  async function fetchData() {
    setIsLoadingADSMeta(true);
    try {
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/ads/meta/${store}/${startDate}/${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDataADSMeta(data);
      setIsLoadingADSMeta(false);
    } catch (error) {
      setIsLoadingADSMeta(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [store, date]);

  return { dataADSMeta, isLoadingADSMeta }; // Retornando também o estado de loading
}
