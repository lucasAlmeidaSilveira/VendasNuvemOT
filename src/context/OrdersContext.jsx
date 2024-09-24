import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { adjustDate } from '../tools/tools.ts';
import { useAuth } from './AuthContext';

export const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [automaticUpdate, setAutomaticUpdate] = useState(false);
  const [store, setStore] = useState('outlet');
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
    setAllOrders([])
    setCustomers([]);
  };

  const fetchOrdersData = async (startDateISO, endDateISO) => {
    try {
      const response = await fetch(
        `https://node-vendasnuvemot.onrender.com/db/orders/${store}/${startDateISO}/${endDateISO}`,
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }
      const data = await response.json();
      return data;
    } catch (err) {
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

    try {
      setIsLoading(true);
      const ordersData = await fetchOrdersData(startDateISO, endDateISO);
      setAllOrders(ordersData);
      setError({});
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
    } finally {
      saveDate();
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

  const value = {
    allOrders,
    setAllOrders,
    customers,
    setCustomers,
    date,
    setDate,
    resetData,
    store,
    setStore,
    isLoading,
    setIsLoading,
    fetchData,
    automaticUpdate,
    setAutomaticUpdate,
    currentDateLocalStorage,
    isOnline,
    error,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
