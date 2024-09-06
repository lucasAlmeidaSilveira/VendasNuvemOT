import React from "react";
import "./style.css";
import { IoReloadCircleSharp } from "react-icons/io5";
import { useOrders } from "../../context/OrdersContext";
import { useAnalytics } from "../../context/AnalyticsContext";

export function ButtonReload() {
  const { isLoading, isLoadingAllOrders, fetchAllOrders } = useOrders();
  const { fetchDataGoogle, fetchDataADSMeta } = useAnalytics();

  const handleReload = () => {
    fetchAllOrders()
		fetchDataGoogle();
		fetchDataADSMeta();
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
