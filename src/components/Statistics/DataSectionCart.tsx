import React, { useEffect, useMemo, useState } from "react";
import { BudgetItem } from "./BudgetItem";
import { ContainerOrders, ContainerGeral } from './styles';
import { useAnalytics } from "../../context/AnalyticsContext";
import { useOrders } from "../../context/OrdersContext";
import { formatCurrency } from "../../tools/tools";
import { useCoupons } from "../../context/CouponsContext";

interface DataSectionCartProps {
  bgcolor: string;
  totalAdSpend: number;
}

interface Coupon {
  code: string;
  used: number;
  value: string;
}

interface Order {
  id: string;
  createdAt: string;
  total: string;
  data: {
    coupon: Coupon[];
  };
}

const DEFAULT_VALUE = '0';

export function DataSectionCart({ bgcolor, totalAdSpend }: DataSectionCartProps) {
  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { orders, isLoading } = useOrders();
  const { coupons } = useCoupons();
  const [ordersWithCashback, setOrdersWithCashback] = useState<Order[]>([]);
  const [visits, setVisits] = useState(DEFAULT_VALUE);
  const [carts, setCarts] = useState(DEFAULT_VALUE);
  const [costCarts, setCostCart] = useState(DEFAULT_VALUE);

  useEffect(() => {
    const filteredOrders = orders.filter(order => 
      order.data.coupon && order.data.coupon.some(coupon => coupon.code.startsWith('MTZ'))
    );
    setOrdersWithCashback(filteredOrders);
  }, [orders]);

  const couponsCashback = coupons.filter(coupon => coupon.code.startsWith('MTZ'))

  useEffect(() => {
    if (data) {
      const { totalVisits, carts } = data;
      setVisits(parseInt(totalVisits).toLocaleString('pt-BR'));
      setCarts(parseInt(carts).toLocaleString('pt-BR'));
    }
  }, [data]);

  useEffect(() => {
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    if((totalAdSpend && numericCarts) !== 0){
      setCostCart(formatCurrency(totalAdSpend / numericCarts));
    }
  }, [carts, totalAdSpend]);

  const cartRate = useMemo(() => {
    const numericVisits = parseInt(visits.replace(/\D/g, ''));
    const numericCarts = parseInt(carts.replace(/\D/g, ''));
    return numericVisits > 0
      ? ((numericCarts / numericVisits) * 100).toFixed(2) + '%'
      : '0.00';
  }, [carts, visits]);

  const totalCashbackSales = ordersWithCashback.length;
  const totalCashbackRevenue = ordersWithCashback.reduce((sum, order) => {
    return sum + parseFloat(order.total);
  }, 0);
  
  const totalCashbackValue = ordersWithCashback.reduce((sum, order) => {
    const coupon = order.data.coupon.find(c => c.code.startsWith('MTZ'));
    return sum + (coupon ? parseFloat(coupon.value) : 0);
  }, 0);

  const costCashback = totalCashbackValue > 0 ? formatCurrency(totalCashbackValue) : '0.00';
  const roiCashback = totalCashbackValue > 0 ? (totalCashbackRevenue / totalCashbackValue).toFixed(2) : '0.00';

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Carrinho e Cashback</h4>
        <div className="row">
          <BudgetItem title="Carrinhos criados" tooltip="Google Analytics" value={carts} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Taxa de carrinho" tooltip="Carrinhos x Visitas" value={cartRate} isLoading={isLoadingAnalytics} />
          <BudgetItem title="Custo de carrinho" tooltip="Vendas x Carrinhos" value={costCarts} isLoading={isLoadingAnalytics} />
        </div>
        <div className="row">
          <BudgetItem title="Vendas | Cashback" tooltip="Vendas com Cashback" value={totalCashbackSales} small={couponsCashback.length} isLoading={isLoading} />
          <BudgetItem title="Faturamento | Cashback" tooltip="Vendas com Cashback (R$)" value={formatCurrency(totalCashbackRevenue)} isLoading={isLoading} />
          <BudgetItem title="Custo | Cashback" tooltip="Custo com cashback" value={costCashback} small={`ROI: ${roiCashback}`} isLoading={isLoading} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}