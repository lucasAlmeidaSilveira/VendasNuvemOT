import { isOrderOnDate } from './isOrderFromToday';

export function filterOrders(orders, date) {
  // Filtrar os pedidos da data de hoje, excluindo os de parceira method = 'other'
  const ordersToday = orders.filter(
    order =>
      isOrderOnDate(order.created_at, date) &&
      order.status !== 'cancelled' &&
      order.payment_status !== 'voided' &&
      order.payment_details?.method !== 'other',
  );

  // Filtrar todos os pedidos da data de hoje, excluindo os de parceira method = 'other'
  const ordersAllToday = orders.filter(
    order =>
      isOrderOnDate(order.created_at, date) &&
      order.payment_details?.method !== 'other',
  );

  // Filtrar todos os pedidos da data de hoje, excluindo os de parceira method = 'other'
  const ordersAllTodayWithPartner = orders.filter(order =>
    isOrderOnDate(order.created_at, date) &&
    order.status !== 'cancelled'
  );

  // Total de todos os pedidos
  const totalOrders = ordersToday.reduce((total, order) => {
    const orderTotalNumber = parseFloat(order.total);
    return total + orderTotalNumber;
  }, 0);

  // Total formatado
  const totalOrdersFormatted = totalOrders.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Filtrar os pedidos com status "Pago"
  const paidOrders = ordersToday.filter(order => order.payment_status === 'paid');

  // Filtrar os pedidos do Chatbot
  const paidOrdersChatbot = ordersToday.filter(order => 
    order.payment_status === 'paid' &&
    order.storefront === 'Loja'
  );

  // Somar os valores totais dos pedidos com status "Pago"
  const totalPaidAmountChatbot = paidOrdersChatbot.reduce((total, order) => {
    return total + parseFloat(order.total); // Use parseFloat para garantir que os valores sejam somados corretamente
  }, 0);

  // Somar os valores totais dos pedidos com status "Pago"
  const totalPaidAmount = paidOrders.reduce((total, order) => {
    return total + parseFloat(order.total); // Use parseFloat para garantir que os valores sejam somados corretamente
  }, 0);

  // Total de pedidos pagos formatado
  const totalPaidAmountFormatted = totalPaidAmount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Total de pedidos pagos Chatbot formatado
  const totalPaidAmountChatbotFormatted = totalPaidAmountChatbot.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Somar os valores totais dos pedidos com status "Pago"
  const totalPaidAllAmount = ordersAllToday.reduce((total, order) => {
    return total + parseFloat(order.total); // Use parseFloat para garantir que os valores sejam somados corretamente
  }, 0);

  // Total de pedidos pagos formatado
  const totalPaidAllAmountFormatted = totalPaidAllAmount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return {
    paidOrders,
    ordersToday,
    totalOrdersFormatted,
    totalPaidAmountFormatted,
    totalPaidAmountChatbot,
    totalPaidAmountChatbotFormatted,
    totalPaidAllAmountFormatted,
    ordersAllToday,
    ordersAllTodayWithPartner,
  };
}

export function filterOrdersAll(orders) {
  const ordersAllList = orders.filter(
    order =>
      order.payment_status !== 'cancelled'
  );

  return {
    ordersAllList,
  };
}
