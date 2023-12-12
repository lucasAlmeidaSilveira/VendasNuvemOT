import React, { createContext, useState, useContext, useEffect } from "react"

export const OrdersContext = createContext()

export const useOrders = () => useContext(OrdersContext)

// eslint-disable-next-line react/prop-types
export const OrdersProvider = ({ children }) => {
	const [orders, setOrders] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	// Define a data atual para o início do dia
	const currentDateStart = new Date()
	currentDateStart.setHours(
		0, 0, 0, 0
	)

	// Define a data atual para o final do dia
	const currentDateEnd = new Date()
	currentDateEnd.setHours(
		23, 59, 59, 999
	)

	const [date, setDate] = useState([currentDateStart, currentDateEnd])
	const [error, setError] = useState(null)

	// Função para formatar a data para ISO 8601
	const formatDateToISO = (date) => {
		return date.toISOString()
	}

	// Função para buscar dados da API
	const fetchData = async () => {
		try {
			setIsLoading(true)
			const startDateISO = formatDateToISO(date[0])
			const endDateISO = formatDateToISO(date[1])
			const response = await fetch(`https://node-vendasnuvemot.onrender.com/orders/${startDateISO}/${endDateISO}`)
			if (!response.ok) {
				throw new Error("Erro ao buscar pedidos")
			}
			const data = await response.json()
			setOrders(data)
		} catch (err) {
			setError(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	// Chamada da API quando 'date' muda
	useEffect(() => {
		fetchData()
	}, [date])

	const value = {
		orders,
		setOrders,
		date,
		setDate,
		isLoading,
		setIsLoading,
		fetchData,
		error
	}

	return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
