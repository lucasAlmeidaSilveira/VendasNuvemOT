import React, { createContext, useState, useContext, useEffect } from 'react';
import { formatDateToISO } from '../tools/tools';
import { getOrders, getOrderByDateRange, saveOrders, clearOrders } from '../db';

export const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPeriodic, setIsLoadingPeriodic] = useState(false);
  const [isLoadingInitialSync, setIsLoadingInitialSync] = useState(false);
  const [automaticUpdate, setAutomaticUpdate] = useState(false);
  const [store, setStore] = useState('outlet');
  const [currentDateLocalStorage, setCurrentDateLocalStorage] = useState('')

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
      const response = await fetch(
        `https://node-vendasnuvemot.onrender.com/orders/${store}/${startDateISO}/${endDateISO}`,
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }
      const data = await response.json();
      await saveOrders(store, data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchAllOrders = async () => {
    try {
      const allOrdersFromDB = await getOrders(store);
      setAllOrders(allOrdersFromDB);
    } catch (err) {
      setError(err.message);
    }
  };

  const forceUpdate = async () => {
    const startDateISO = formatDateToISO(date[0]);
    const endDateISO = formatDateToISO(date[1]);

    try {
      setIsLoading(true);
      const ordersData = await fetchOrdersData(startDateISO, endDateISO);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      saveDate();
      await fetchAllOrders(); // Atualiza a lista de todos os pedidos após a atualização forçada
    }
  };

  const syncInitialData = async () => {
    const startDate = new Date('2023-11-22');
    let currentDate = new Date();
    const endDate = startDate;

    try {
      setIsLoadingInitialSync(true);
      while (currentDate > endDate) {
        let previousMonthDate = new Date(currentDate);
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
        if (previousMonthDate < endDate) previousMonthDate = endDate;

        const startDateISO = formatDateToISO(previousMonthDate);
        const endDateISO = formatDateToISO(currentDate);

        await fetchOrdersData(startDateISO, endDateISO);

        currentDate = previousMonthDate;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingInitialSync(false);
      saveDate();
      await fetchAllOrders(); // Atualiza a lista de todos os pedidos após a sincronização inicial
    }
  };

  const checkIfAllDaysHaveOrders = async (startDateISO, endDateISO) => {
    const localOrders = await getOrderByDateRange(
      store,
      startDateISO,
      endDateISO,
    );
    const dateRange = getDatesBetween(
      new Date(startDateISO),
      new Date(endDateISO),
    );

    return dateRange.every(date => {
      const formattedDate = date.toISOString().split('T')[0];
      return localOrders.some(
        order => order.createdAt.split('T')[0] === formattedDate,
      );
    });
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const fetchData = async () => {
    const startDateISO = formatDateToISO(date[0]);
    const endDateISO = formatDateToISO(date[1]);

    try {
      setIsLoading(true);
      const allDaysHaveOrders = await checkIfAllDaysHaveOrders(
        startDateISO,
        endDateISO,
      );
      if (allDaysHaveOrders) {
        const localOrders = await getOrderByDateRange(
          store,
          startDateISO,
          endDateISO,
        );
        setOrders(localOrders);
      } else {
        const ordersData = await fetchOrdersData(startDateISO, endDateISO);
        setOrders(ordersData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      saveDate();
      await fetchAllOrders(); // Atualiza a lista de todos os pedidos após a busca dos pedidos filtrados
    }
  };

  const fetchRecentData = async () => {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    const startDateISO = formatDateToISO(pastDate);
    const endDateISO = formatDateToISO(currentDate);

    try {
      setIsLoadingPeriodic(true);
      await fetchOrdersData(startDateISO, endDateISO);
      const localOrders = await getOrderByDateRange(
        store,
        startDateISO,
        endDateISO,
      );
      setOrders(localOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingPeriodic(false);
      saveDate();
      await fetchAllOrders(); // Atualiza a lista de todos os pedidos após a busca dos dados recentes
    }
  };

  const saveDate = () => {
    const adjustedDate = new Date();
    adjustedDate.setHours(adjustedDate.getHours() - 3); // Ajusta a data para o fuso horário correto
    localStorage.setItem('lastSyncDate', adjustedDate.toISOString());
    setCurrentDateLocalStorage(adjustedDate.toISOString());
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isLoadingInitialSync) {
        event.preventDefault();
        event.returnValue = 'A sincronização inicial ainda está em andamento. Tem certeza de que deseja sair?';
      }
      saveDate();
    };

    const initializeData = async () => {
      const storedOrders = await getOrders(store);
      if (storedOrders.length === 0) {
        await syncInitialData();
      } else {
        // Verificar última sincronização
        const lastSyncDate = localStorage.getItem('lastSyncDate');
        if (lastSyncDate) {
          const lastSync = new Date(lastSyncDate);
          const currentDate = new Date();
          if (currentDate > lastSync) {
            // Sincronizar desde o último acesso
            const startDateISO = formatDateToISO(lastSync);
            const endDateISO = formatDateToISO(currentDate);
            await fetchOrdersData(startDateISO, endDateISO);
          }
        }
        await fetchAllOrders(); // Atualiza a lista de todos os pedidos após a inicialização
      }
    };

    initializeData();
    // Salvar a data de última sincronização no localStorage ao fechar a página
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [store, isLoadingInitialSync]);

  useEffect(() => {
    fetchData();
  }, [date, store]);

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
    }, 600000); // 10 minutos em milissegundos

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
    isLoadingInitialSync,
    fetchData,
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
