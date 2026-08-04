import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { adjustDate } from '../tools/tools.ts';
import { useAuth } from './AuthContext';
import { env } from '../utils/env';

export const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [automaticUpdate, setAutomaticUpdate] = useState(false);
  const [store, setStore] = useState('artepropria');
  const [currentDateLocalStorage, setCurrentDateLocalStorage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState({});

  const currentDateStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const currentDateEnd = useMemo(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  const [date, setDate] = useState([currentDateStart, currentDateEnd]);

  const resetData = () => {
    setCustomers([]);
  };

  // Cancela a busca do período anterior ao iniciar uma nova, para que uma
  // resposta atrasada não sobrescreva `customers` do período atual.
  const abortRef = useRef(null);

  const fetchCustomersData = async (startDateISO, endDateISO, signal) => {
    const url = `${env.apiUrl}customers/${store}/${startDateISO}/${endDateISO}`;
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }
      const data = await response.json();

      return data;
    } catch (err) {
      if (err?.name === 'AbortError') throw err; // troca de período, não falha
      setError({
        message: err.message,
        type: 'server_offline',
      });
      throw err;
    }
  };

  const fetchData = async () => {
    const startDateISO = adjustDate(date[0]);
    const endDateISO = adjustDate(date[1]);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsLoading(true);
      setIsLoadingCustomers(true);
      const customersData = await fetchCustomersData(
        startDateISO,
        endDateISO,
        controller.signal,
      );
      setCustomers(customersData);
      setError({});
    } catch (err) {
      // Aborto significa que outra busca assumiu: não mexe em loading nem em
      // erro, senão apagaria o estado de carregamento da busca mais nova.
      if (err?.name === 'AbortError') return;
      setError(err.message);
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
        setIsLoadingCustomers(false);
        saveDate();
      }
    }
  };

  const saveDate = () => {
    const adjustedDate = new Date();
    adjustedDate.setHours(adjustedDate.getHours() - 3); // Ajusta a data para o fuso horário correto
    localStorage.setItem('lastSyncDate', adjustedDate.toISOString());
    setCurrentDateLocalStorage(adjustedDate.toISOString());
  };

  // Alterando o useEffect para só buscar pedidos se o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      // Verifica se o usuário está autenticado
      resetData();
      fetchData();
    }
  }, [store, date, user]); // Agora escuta mudanças no "user" também

  // Outro useEffect que realiza chamadas periódicas de atualização, mas só se o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      // Verifica se o usuário está autenticado
      const intervalId = setInterval(() => {
        fetchData();
      }, 900000); // 15 minutos em milissegundos

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [store, date, user]); // Agora escuta mudanças no "user" também

  // Verificação de conexão com a internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Memoizado: este contexto é consumido por praticamente toda a árvore
  // (`date` e `store` alimentam todas as abas). Um literal novo a cada render
  // forçava re-render de todos os consumidores mesmo sem nada ter mudado.
  // `fetchData` e `resetData` são recriados a cada render, então entram nas
  // deps — o ganho vem de não recriar o objeto quando só o pai re-renderiza.
  const value = useMemo(
    () => ({
      customers,
      setCustomers,
      date,
      setDate,
      resetData,
      store,
      setStore,
      isLoading,
      isLoadingCustomers,
      setIsLoading,
      fetchData,
      automaticUpdate,
      setAutomaticUpdate,
      currentDateLocalStorage,
      isOnline,
      error,
    }),
    [
      customers,
      date,
      store,
      isLoading,
      isLoadingCustomers,
      automaticUpdate,
      currentDateLocalStorage,
      isOnline,
      error,
    ],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
