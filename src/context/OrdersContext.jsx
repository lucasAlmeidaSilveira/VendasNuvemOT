import React, { createContext, useState, useContext, useEffect } from "react";
import { formatDateToISO } from "../tools/tools";

export const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

// eslint-disable-next-line react/prop-types
export const OrdersProvider = ({ children }) => {
	const [ orders, setOrders ] = useState([]);
	const [ customers, setCustomers ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(true);
	const [ isLoadingCustomers, setIsLoadingCustomers ] = useState(true);
	const [ store, setStore ] = useState("outlet");

	// Define a data atual para o início do dia
	const currentDateStart = new Date();
	currentDateStart.setHours(0, 0, 0, 0);

	// Define a data atual para o final do dia
	const currentDateEnd = new Date();
	currentDateEnd.setHours(23, 59, 59, 999);

	const [ date, setDate ] = useState([currentDateStart, currentDateEnd]);
	const [ error, setError ] = useState(null);
	const [ errorCustomers, setErrorCustomers ] = useState(null);

	const resetData = () => {
		setDate([currentDateStart, currentDateEnd]);
		setOrders([]);
		setCustomers([]);
	};

	// Função para buscar dados de pedidos da API
	const fetchOrdersData = async () => {
		setOrders([]);
		try {
			setIsLoading(true);
			const startDateISO = formatDateToISO(date[0]);
			const endDateISO = formatDateToISO(date[1]);
			const response = await fetch(`https://node-vendasnuvemot.onrender.com/orders/${store}/${startDateISO}/${endDateISO}`);
			if (!response.ok) {
				throw new Error("Erro ao buscar pedidos");
			}
			const data = await response.json();
			setOrders(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Função para buscar dados de customers da API
	const fetchCustomersData = async () => {
		setCustomers([]);
		try {
			setIsLoadingCustomers(true);
			const startDateISO = formatDateToISO(date[0]);
			const endDateISO = formatDateToISO(date[1]);
			const response = await fetch(`https://node-vendasnuvemot.onrender.com/customers/${store}/${startDateISO}/${endDateISO}`);
			if (!response.ok) {
				throw new Error("Erro ao buscar customers");
			}
			const data = await response.json();
			setCustomers(data);
		} catch (err) {
			setErrorCustomers(err.message);
		} finally {
			setIsLoadingCustomers(false);
		}
	};

	const fetchData = async () => {
		fetchOrdersData();
		fetchCustomersData();
	}

	// Chamada da API quando 'date' ou 'store' mudam
	useEffect(() => {
		fetchData()
	}, [date, store]);

	const value = {
		orders,
		setOrders,
		customers,
		setCustomers,
		date,
		setDate,
		resetData,
		store,
		setStore,
		isLoading,
		setIsLoading,
		isLoadingCustomers,
		setIsLoadingCustomers,
		fetchData,
		error,
		errorCustomers,
	};

	return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};
