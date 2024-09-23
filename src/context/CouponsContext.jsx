import React, { createContext, useState, useContext, useEffect } from 'react';
import { useOrders } from './OrdersContext';
import { useTab } from './TabContext';

export const CouponContext = createContext();

export const useCoupons = () => useContext(CouponContext);

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
	const [error, setError] = useState(null)
  const { store, date } = useOrders()
  const { activeTab } = useTab()

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
		if(activeTab === 2 || activeTab === 4) {
			fetchData() 
		}
	}, [store, date, activeTab])

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
