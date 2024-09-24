import { isOrderOnDate } from './isOrderFromToday';

// Função genérica para calcular totais
const calculateTotal = (orders) =>
  orders.reduce((total, order) => total + parseFloat(order.total), 0);

export function filterOrders(orders, date) {
  const filterOrdersByConditions = (extraConditions) =>
    orders.filter(order => 
      isOrderOnDate(order.created_at, date) &&
      order.payment_details?.method !== 'other' &&
      extraConditions(order)
    );

  const ordersToday = filterOrdersByConditions(order => order.status !== 'cancelled' && order.payment_status !== 'voided');
  const ordersAllToday = filterOrdersByConditions(() => true);
  const ordersAllTodayWithPartner = orders.filter(order =>
    isOrderOnDate(order.created_at, date) && order.status !== 'cancelled'
  );

  const totals = {
    totalOrdersFormatted: calculateTotal(ordersToday).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountChatbotFormatted: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid' && order.storefront === 'Loja')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountEcomFormatted: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid' && order.storefront !== 'Loja')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAllAmountEcomFormatted: calculateTotal(ordersToday.filter(order => order.storefront !== 'Loja')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountFormatted: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAllAmountFormatted: calculateTotal(ordersAllToday).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  };

  return {
    ordersToday,
    ordersAllToday,
    ordersAllTodayWithPartner,
    ...totals,
  };
}
