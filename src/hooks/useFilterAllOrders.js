import { isOrderOnDate } from "../tools/isOrderFromToday";

export function useFilterAllOrders(orders, date) {
  // Filtrar os pedidos da data de hoje
  const ordersFiltered = orders.filter(
    order =>
      isOrderOnDate(order.createdAt, date)
  );

  // Total de todos os pedidos
  const totalOrders = ordersFiltered.reduce((total, order) => {
    const orderTotalNumber = parseFloat(order.total);
    return total + orderTotalNumber;
  }, 0);

  // Total formatado
  const totalOrdersFormatted = totalOrders.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Filtrar os pedidos com status "Pago"
  const paidOrders = ordersFiltered.filter(order => order.status === 'paid');

  // Somar os valores totais dos pedidos com status "Pago"
  const totalPaidAmount = paidOrders.reduce((total, order) => {
    return total + parseFloat(order.total); // Use parseFloat para garantir que os valores sejam somados corretamente
  }, 0);

  // Total de pedidos pagos formatado
  const totalPaidAmountFormatted = totalPaidAmount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return {
    paidOrders,
    ordersFiltered,
    totalOrdersFormatted,
    totalPaidAmountFormatted,
  };
}
