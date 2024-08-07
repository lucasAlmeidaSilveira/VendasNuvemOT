import React, { createContext, useState, useContext, useEffect } from 'react';
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

  const currentDateStart = new Date();
  currentDateStart.setHours(0, 0, 0, 0);

  const currentDateEnd = new Date();
  currentDateEnd.setHours(23, 59, 59, 999);

  const [date, setDate] = useState([currentDateStart, currentDateEnd]);
  const [error, setError] = useState(null);

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
      throw err;
    }
  };

  const fetchAllOrdersData = async () => {
    try {
      setIsLoadingAllOrders(true);
      const response = await fetch(`https://node-vendasnuvemot.onrender.com/db/orders/${store}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingAllOrders(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const allOrdersFromDB = await fetchAllOrdersData();
      setAllOrders(allOrdersFromDB);
    } catch (err) {
      setError(err.message);
    }
  };

  const forceUpdate = async () => {
    const startDateISO = adjustDate(date[0]);
    const endDateISO = adjustDate(date[1]);
    try {
      setIsLoading(true);
      const allOrdersFromDB = await fetchOrdersData(startDateISO, endDateISO);
      setOrders(allOrdersFromDB);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
    localStorage.setItem('lastSyncDate', adjustedDate);
    setCurrentDateLocalStorage(adjustedDate);
  };

  useEffect(() => {
    fetchData();
  }, [date, store]);
  
  useEffect(() => {
    forceUpdate();
    fetchAllOrders()
  }, [store]);
  
  useEffect(() => {
    if (automaticUpdate) {
      forceUpdate();
      const intervalPeriodicFilter = setInterval(() => {
        forceUpdate();
      }, 60000); // 1 minuto em milissegundos
      
      return () => clearInterval(intervalPeriodicFilter); // Cleanup on unmount
    }
    
  }, [store, automaticUpdate]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRecentData();
      fetchAllOrders()
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
    forceUpdate,
    automaticUpdate,
    setAutomaticUpdate,
    currentDateLocalStorage,
    error,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
