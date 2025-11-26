import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { adjustDate } from '../tools/tools.ts';
import { useAuth } from './AuthContext';
import { env } from '../utils/env';

export const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  const [allNewOrders, setAllNewOrders] = useState([]);

  const [allFullOrders, setAllFullOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingAllOrders, setIsLoadingAllOrders] = useState(true);
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

  //alteração da data original para receber a data do dia anterior
  const newCurrentDateStart = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Subtrai 1 dia
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const newCurrentDateEnd = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Subtrai 1 dia
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  const [newDate, setNewDate] = useState([
    newCurrentDateStart,
    newCurrentDateEnd,
  ]);

  const resetData = () => {
    setAllOrders([]);
    setCustomers([]);
  };

  const resetDataAll = () => {
    setAllFullOrders([]);
  };

  const fetchOrdersData = async (startDateISO, endDateISO) => {
    const url = `${env.apiUrl}db/orders/${store}/${startDateISO}/${endDateISO}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        //console.log('DEBUG orders NOK:', store);
        //console.log('DEBUG url:', url);
        //console.log('DEBUG startDateISO:', startDateISO);
        //console.log('DEBUG endDateISO:', endDateISO);

        throw new Error('Erro ao buscar pedidos');
      }
      const data = await response.json();
      //console.log('DEBUG orders OK:', store);
      //console.log('DEBUG url:', url);
      //console.log('DEBUG startDateISO:', startDateISO);
      //console.log('DEBUG endDateISO:', endDateISO);
      return data;
    } catch (err) {
      //console.log('DEBUG orders ERROR:', store);
      //console.log('DEBUG url:', url);
      //console.log('DEBUG startDateISO:', startDateISO);
      //console.log('DEBUG endDateISO:', endDateISO);
      setError({
        message: err.message,
        type: 'server_offline',
      });
      throw err;
    }
  };

  const fetchCustomersData = async (startDateISO, endDateISO) => {
    const url = `${env.apiUrl}customers/${store}/${startDateISO}/${endDateISO}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
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

  const fetchAllOrdersData = async () => {
    try {
      const response = await fetch(
        `${env.apiUrl}db/orders/${store}`,
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar todos os pedidos');
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

  const fetchDataAll = async () => {
    try {
      setIsLoadingAllOrders(true);
      const ordersData = await fetchAllOrdersData();
      setAllFullOrders(ordersData);
      setError({});
      setIsLoadingAllOrders(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchData = async () => {
    const startDateISO = adjustDate(date[0]);
    const endDateISO = adjustDate(date[1]);

    //valor de datas alterados -1
    const startNewDateISO = adjustDate(newDate[0]);
    const endNewDateISO = adjustDate(newDate[1]);

    try {
      setIsLoading(true);
      setIsLoadingCustomers(true);
      const ordersData = await fetchOrdersData(startDateISO, endDateISO);
      const ordersNewData = await fetchOrdersData(
        startNewDateISO,
        endNewDateISO,
      );
      setAllNewOrders(ordersNewData);
      setAllOrders(ordersData);
      setError({});
      setIsLoading(false);
      const customersData = await fetchCustomersData(startDateISO, endDateISO);
      setCustomers(customersData);
      setIsLoadingCustomers(false);
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

  // Recuperando todo os pedidos para mostrar quantidade de vendas de todos produtos
  useEffect(() => {
    if (user) {
      // Verifica se o usuário está autenticado
      resetDataAll();
      fetchDataAll();
    }
  }, [store]); // Agora escuta mudanças no "user" também

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
    allNewOrders,
    allOrders,
    allFullOrders,
    setAllOrders,
    customers,
    setCustomers,
    date,
    setDate,
    resetData,
    store,
    setStore,
    isLoading,
    isLoadingAllOrders,
    isLoadingCustomers,
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
