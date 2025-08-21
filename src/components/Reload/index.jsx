import React from 'react';
import './style.css';
import { IoReloadCircleSharp } from 'react-icons/io5';
import { useOrders } from '../../context/OrdersContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';
import { useRefunds } from '../../context/RefundsContext';
import { useTikTokAds } from '../../context/TikTokAdsContext';
import { useMandae } from '../../context/MandaeContext';

export function ButtonReload() {
  const { isLoading, fetchData, store } = useOrders();
  const { fetchDataGoogle, fetchDataADSMeta } = useAnalytics();
  const { reloadRefunds } = useRefunds();
  const { user } = useAuth();
  const { fetchTikTokAds } = useTikTokAds();
  const { deliveries, loading, error, fetchDeliveries } = useMandae();

  const handleReload = () => {
    if (user) {
      fetchData();
      fetchDataGoogle();
      fetchDataADSMeta();
      fetchTikTokAds();
      reloadRefunds();
      fetchDeliveries({ store });
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
