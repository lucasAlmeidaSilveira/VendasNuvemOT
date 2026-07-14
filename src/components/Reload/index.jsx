import React from 'react';
import './style.css';
import { IoReloadCircleSharp } from 'react-icons/io5';
import { useOrders } from '../../context/OrdersContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';
import { useRefunds } from '../../context/RefundsContext';
import { useTikTokAds } from '../../context/TikTokAdsContext';
import { useMandae } from '../../context/MandaeContext';
import { useDatabaseContext } from '../../context/DbContext';

export function ButtonReload() {
  const { isLoading, fetchData, store } = useOrders();
  const { fetchDataGoogle } = useAnalytics();
  const { reloadData, state } = useDatabaseContext();
  const { reloadRefunds } = useRefunds();
  const { user } = useAuth();
  const { fetchTikTokAds } = useTikTokAds();
  const { fetchDeliveries } = useMandae();

  const handleReload = () => {
    if (user) {
      // Base nova: refetch de Dashboard/Orders/Statistics/Coupons (orders_shop,
      // daily_sales, ads, coupon) via reloadKey do DbContext + hooks.
      reloadData();
      // Analytics agora vem da tabela `ads` (Google + Meta numa só chamada).
      fetchDataGoogle();
      // OrdersContext legado: agora só busca `customers` (Inscrições Popup,
      // sem equivalente na base nova). Externos: TikTok, Refunds e Mandae.
      fetchData();
      fetchTikTokAds();
      reloadRefunds();
      fetchDeliveries({ store });
    }
  };

  // Gira também durante o carregamento da nova base (DbContext), não só do
  // OrdersContext legado.
  const busy = isLoading || state.loading;

  return (
    <button
      className={`boxReload ${busy ? 'loading' : ''}`}
      onClick={handleReload}
      aria-label="Recarregar dados"
    >
      <IoReloadCircleSharp color="#FCFAFB" fontSize="40" />
    </button>
  );
}
