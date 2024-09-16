import React, { useEffect, useMemo, useState } from "react";
import { BudgetItem } from "./BudgetItem";
import { ContainerOrders, ContainerGeral } from './styles';
import { useAnalytics } from "../../context/AnalyticsContext";
import { useOrders } from "../../context/OrdersContext";
import { formatCurrency } from "../../tools/tools";
import { useCoupons } from "../../context/CouponsContext";
import { FaWhatsapp } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { filterOrders } from "../../tools/filterOrders";

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
  created_at: string;
  total: string;
  coupon: Coupon[];
}

interface CouponProps {
  code: string;
  id: number;
  type: string;
  used: number;
  value: string;
}

const DEFAULT_VALUE = '0';

export function DataSectionCart({ bgcolor, totalAdSpend }: DataSectionCartProps) {
  const { data, isLoadingADSGoogle } = useAnalytics();
  const { allOrders, date, isLoading } = useOrders();
  const { ordersToday } = filterOrders(allOrders, date);
  const { coupons } = useCoupons();
  const [ ordersWithCashback, setOrdersWithCashback ] = useState<Order[]>([]);
  const [ cartsRecoveryWhats, setCartsRecoveryWhats ] = useState<Order[]>([])
  const [ cartsRecoveryEmail, setCartsRecoveryEmail ] = useState<Order[]>([])
  const [ visits, setVisits ] = useState(DEFAULT_VALUE);
  const [ carts, setCarts ] = useState(DEFAULT_VALUE);
  const [ costCarts, setCostCart ] = useState(DEFAULT_VALUE);

  const couponsCashback = coupons.filter((coupon: CouponProps) => coupon.code.startsWith('MTZ'))
  const couponsWhats = ['WHATS10', 'WHATS15', 'WHATS20']
  const couponsEmail = ['OUTLET10', 'GANHEI10']

  useEffect(() => {
    const filteredOrdersCashBack = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => coupon.code.startsWith('MTZ'))
    );

    const filteredOrdersCartsWhats = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => couponsWhats.includes(coupon.code))
    );

    const filteredOrdersCartsEmail = ordersToday.filter((order: Order) => 
      order.coupon && order.coupon.some(coupon => couponsEmail.includes(coupon.code))
    );
    
    setOrdersWithCashback(filteredOrdersCashBack);
    setCartsRecoveryWhats(filteredOrdersCartsWhats);
    setCartsRecoveryEmail(filteredOrdersCartsEmail);
  }, [date, allOrders]);

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
    const coupon = order.coupon.find(c => c.code.startsWith('MTZ'));
    return sum + (coupon ? parseFloat(coupon.value) : 0);
  }, 0);

  const costCashback = totalCashbackValue > 0 ? formatCurrency(totalCashbackValue) : 'R$ 0,00';
  const roiCashback = totalCashbackValue > 0 ? (totalCashbackRevenue / totalCashbackValue).toFixed(2) : '0.00';

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Dados de Carrinho e Cashback</h4>
        <div className="row">
          <BudgetItem title="Carrinhos criados" tooltip="Google Analytics" value={carts} isLoading={isLoadingADSGoogle} />
          <BudgetItem title="Taxa de carrinho" tooltip="Carrinhos x Visitas" value={cartRate} isLoading={isLoadingADSGoogle} />
          <BudgetItem title="Custo de carrinho" tooltip="Vendas x Carrinhos" value={costCarts} isLoading={isLoadingADSGoogle} />
        </div>
        <div className="row">
          <BudgetItem icon={FaWhatsapp} iconColor={'var(--uipositive-100)'} title="Carrinhos recuperados" small={'Whatsapp'} tooltip={`Cupons: ${couponsWhats.join(', ')}`} value={cartsRecoveryWhats.length} isLoading={isLoading} />
          <BudgetItem icon={IoIosMail} iconColor={'var(--geralblack-100)'} title="Carrinhos recuperados" small={'Email'} tooltip={`Cupons: ${couponsEmail.join(', ')}`} value={cartsRecoveryEmail.length} isLoading={isLoading} />
        </div>
        <div className="row">
          <BudgetItem title="Vendas | Cashback" tooltip="Vendas com Cashback" value={totalCashbackSales} small={couponsCashback.length} isLoading={isLoading} />
          <BudgetItem title="Faturamento | Cashback" tooltip="Vendas com Cashback (R$)" value={formatCurrency(totalCashbackRevenue)} small={`ROI: ${roiCashback}`}  isLoading={isLoading} />
          <BudgetItem title="Custo | Cashback" tooltip="Custo com cashback" value={costCashback} isLoading={isLoading} />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}