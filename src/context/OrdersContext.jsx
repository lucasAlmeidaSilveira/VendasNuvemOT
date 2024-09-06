import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { adjustDate } from '../tools/tools';

export const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPeriodic, setIsLoadingPeriodic] = useState(false);
  const [isLoadingAllOrders, setIsLoadingAllOrders] = useState(false);
  const [automaticUpdate, setAutomaticUpdate] = useState(false);
  const [store, setStore] = useState('outlet');
  const [currentDateLocalStorage, setCurrentDateLocalStorage] = useState('');

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
  const [error, setError] = useState({});

  const resetData = () => {
    setOrders([]);
    setCustomers([]);
  };

  const fetchOrdersData = async (startDateISO, endDateISO) => {
    try {
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/db/orders/${store}/${startDateISO}/${endDateISO}`);
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

  const fetchAllOrdersData = async () => {
    try {
      setIsLoadingAllOrders(true);
      setIsLoading(true);
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/db/orders/${store}`);
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
    } finally {
      setIsLoadingAllOrders(false);
      setIsLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const allOrdersFromDB = await fetchAllOrdersData();
      setAllOrders(allOrdersFromDB);
    } catch (err) {
      
    }
    finally {
      saveDate();
    }
  };

  const fetchData = async () => {
    const startDateISO = adjustDate(date[0]);
    const endDateISO = adjustDate(date[1]);

    try {
      setIsLoading(true);
      const ordersData = await fetchOrdersData(startDateISO, endDateISO);
      setOrders(ordersData);
      setError({})
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      saveDate();
    }
  };

  const fetchRecentData = async () => {
    const startDateISO = adjustDate(date[0]);
    const endDateISO = adjustDate(date[1]);

    try {
      setIsLoadingPeriodic(true);
      const localOrders = await fetchOrdersData(startDateISO, endDateISO);
      setOrders(localOrders);
      setError({})
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingPeriodic(false);
      saveDate();
    }
  };

  const saveDate = () => {
    const adjustedDate = new Date();
    adjustedDate.setHours(adjustedDate.getHours() - 3); // Ajusta a data para o fuso horário correto
    localStorage.setItem('lastSyncDate', adjustedDate.toISOString());
    setCurrentDateLocalStorage(adjustedDate.toISOString());
  };

  useEffect(() => {
    resetData()
    fetchData();
    fetchAllOrders();
  }, [store]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRecentData();
      fetchAllOrders();
    }, 1800000); // 30 minutos em milissegundos

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [store]);

  const value = {
    orders,
    setOrders,
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
    isLoadingPeriodic,
    setIsLoading,
    isLoadingAllOrders,
    fetchData,
    fetchAllOrders,
    automaticUpdate,
    setAutomaticUpdate,
    currentDateLocalStorage,
    error,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
