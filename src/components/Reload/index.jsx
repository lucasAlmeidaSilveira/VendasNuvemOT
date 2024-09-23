import React from "react";
import "./style.css";
import { IoReloadCircleSharp } from "react-icons/io5";
import { useOrders } from "../../context/OrdersContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import { useAuth } from "../../context/AuthContext";

export function ButtonReload() {
  const { isLoading, isLoadingAllOrders, fetchData } = useOrders();
  const { fetchDataGoogle, fetchDataADSMeta } = useAnalytics();
  const { user } = useAuth()

  const handleReload = () => {
    if(user) {
      fetchData()
      fetchDataGoogle();
      fetchDataADSMeta();
    }
  };

  return (
    <button
      className={`boxReload ${(isLoadingAllOrders || isLoading) && "loading"}`}
      onClick={handleReload}
      aria-label="Recarregar dados"
    >
      <IoReloadCircleSharp color="#FCFAFB" fontSize="40" />
    </button>
  );
}
