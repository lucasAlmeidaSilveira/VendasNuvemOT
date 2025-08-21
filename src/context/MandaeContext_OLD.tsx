import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {
  Delivery,
  FetchParams,
  MandaeContextType,
  MandaeProviderProps,
} from '../types';

// Criar o contexto
const MandaeContext = createContext<MandaeContextType | undefined>(undefined);

// Hook para usar o contexto
export const useMandae = () => {
  const context = useContext(MandaeContext);
  if (context === undefined) {
    throw new Error('useMandae deve ser usado dentro de um MandaeProvider');
  }
  return context;
};

// Provider Component
export const MandaeProvider: React.FC<MandaeProviderProps> = ({
  children,
  apiBaseUrl = `https://node-vendasnuvemot.onrender.com`,
}) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async ({
    store,
    startDate,
    endDate,
  }: FetchParams) => {
    setLoading(true);
    setError(null);

    try {
      // Construir URL com parâmetros
      const url = `${apiBaseUrl}/mandae/${store}/${startDate}/${endDate}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const data: Delivery[] = await response.json();
      setDeliveries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro desconhecido',
      );
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const clearDeliveries = () => {
    setDeliveries([]);
    setError(null);
  };

  return (
    <MandaeContext.Provider
      value={{
        deliveries,
        loading,
        error,
        fetchDeliveries,
        clearDeliveries,
      }}
    >
      {children}
    </MandaeContext.Provider>
  );
};

