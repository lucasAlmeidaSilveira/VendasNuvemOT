import React, { createContext, useState, useContext, useEffect } from 'react';
import { useOrders } from './OrdersContext';

export const CouponContext = createContext();

export const useCoupons = () => useContext(CouponContext);

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
	const [error, setError] = useState(null)
  const { store } = useOrders()

  // Função para buscar dados da API
	const fetchData = async () => {
		setCoupons([])

		try {
			const response = await fetch(`https://node-vendasnuvemot.onrender.com/coupons/${store}`)
			if (!response.ok) {
				throw new Error("Erro ao buscar pedidos")
			}
			const data = await response.json()
			
			setCoupons(data)
		} catch (err) {
			setError(err.message)
		}
	}

  	// Chamada da API quando 'date' muda
	useEffect(() => {
		fetchData()

		const intervalId = setInterval(fetchData, 300000) // 300000 ms = 5 minutos

		// Função de limpeza para limpar o intervalo
		return () => clearInterval(intervalId)
	}, [store])

  const value = {
    coupons,
    error,
		fetchData
  }

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
};
