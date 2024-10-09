import { isOrderOnDate } from './isOrderFromToday';

// Função genérica para calcular totais
const calculateTotal = (orders) =>
  orders.reduce((total, order) => total + parseFloat(order.total), 0);

// Função genérica para calcular totais baseado nos produtos
const calculateTotalByProductType = (orders, productType) =>
  orders.reduce((total, order) => {
    const filteredProducts = order.products.filter(product => 
      product.name.toLowerCase().includes(productType.toLowerCase())
    );
    
    // Somando o preço dos produtos que correspondem ao tipo (Quadro ou Espelho)
    const productTotal = filteredProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);
    
    return total + productTotal;
  }, 0);

export function filterOrders(orders, date) {
  const filterOrdersByConditions = (extraConditions) =>
    orders.filter(order => 
      isOrderOnDate(order.created_at, date) &&
      order.payment_details?.method !== 'other' &&
      extraConditions(order)
    );

  const ordersToday = filterOrdersByConditions(order => order.status !== 'cancelled' && order.payment_status !== 'voided');
  const ordersTodayPaid = filterOrdersByConditions(order => order.payment_status === 'paid');
  const ordersAllToday = filterOrdersByConditions(() => true);
  const ordersAllTodayWithPartner = orders.filter(order =>
    isOrderOnDate(order.created_at, date) && order.status !== 'cancelled'
  );
    // Cálculo do faturamento por tipo de produto
    const totalQuadros = calculateTotalByProductType(ordersTodayPaid, 'Quadro');
    const totalEspelhos = calculateTotalByProductType(ordersTodayPaid, 'Espelho');

  const totals = {
    totalOrdersFormatted: calculateTotal(ordersToday).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountChatbotFormatted: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid' && order.storefront === 'Loja')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountEcomFormatted: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid' && order.storefront !== 'Loja')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAllAmountEcomFormatted: calculateTotal(ordersToday.filter(order => order.storefront !== 'Loja')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountFormatted: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAllAmountFormatted: calculateTotal(ordersAllToday).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalQuadrosFormatted: totalQuadros,
    totalEspelhosFormatted: totalEspelhos,
    totalPaidAmountChatbot: calculateTotal(ordersToday.filter(order => order.payment_status === 'paid' && order.storefront === 'Loja')),
    totalPaidAllAmountEcom: calculateTotal(ordersToday.filter(order => order.storefront !== 'Loja')),
  };

  return {
    ordersToday,
    ordersTodayPaid,
    ordersAllToday,
    ordersAllTodayWithPartner,
    ...totals,
  };
}
