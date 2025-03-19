import React from 'react';
import './style.css';
import { IoReloadCircleSharp } from 'react-icons/io5';
import { useOrders } from '../../context/OrdersContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';
import { useRefunds } from '../../context/RefundsContext';

export function ButtonReload() {
  const { isLoading, fetchData } = useOrders();
  const { fetchDataGoogle, fetchDataADSMeta } = useAnalytics();
  const { reloadRefunds } = useRefunds();
  const { user } = useAuth();

  const handleReload = () => {
    if (user) {
      fetchData();
      fetchDataGoogle();
      fetchDataADSMeta();
      reloadRefunds();
    }
  };

  return (
    <button
      className={`boxReload ${isLoading && 'loading'}`}
      onClick={handleReload}
      aria-label="Recarregar dados"
    >
      <IoReloadCircleSharp color="#FCFAFB" fontSize="40" />
    </button>
  );
}
