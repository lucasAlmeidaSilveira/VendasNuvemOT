import { isOrderOnDate } from './isOrderFromToday';

// Função genérica para calcular totais
const calculateTotal = orders =>
  orders.reduce((total, order) => total + parseFloat(order.total), 0);

// Função genérica para calcular totais referente aos clientes novos
const calculateTotalClients = orders =>
  orders.reduce((total, order) => total + parseFloat(order.shipping_cost_owner), 0);

// Função genérica para calcular totais baseado nos produtos
const calculateTotalByProductType = (orders, productType) =>
  orders.reduce((total, order) => {
    const filteredProducts = order.products.filter(product =>
      product.name.toLowerCase().includes(productType.toLowerCase()),
    );

    // Somando o preço dos produtos que correspondem ao tipo (Quadro ou Espelho)
    const productTotal = filteredProducts.reduce(
      (sum, product) => sum + parseFloat(product.price),
      0,
    );

    return total + productTotal;
  }, 0);

export function filterOrders(orders, date) {
  const filterOrdersByConditions = extraConditions =>
    orders.filter(
      order =>
        isOrderOnDate(order.created_at, date) &&
        order.payment_details?.method !== 'other' &&
        extraConditions(order),
    );

  const ordersToday = filterOrdersByConditions(
    order => order.status !== 'cancelled' && order.payment_status !== 'voided',
  );
  const ordersTodayPaid = filterOrdersByConditions(
    order =>
      order.payment_status === 'paid' &&
      order.status !== 'cancelled' &&
      order.payment_status !== 'voided',
  );
  const ordersAllToday = filterOrdersByConditions(() => true);
  const ordersAllTodayWithPartner = orders.filter(
    order =>
      isOrderOnDate(order.created_at, date) && order.status !== 'cancelled',
  );
  // Cálculo do faturamento por tipo de produto
  const totalQuadros = calculateTotalByProductType(ordersTodayPaid, 'Quadro');
  const totalEspelhos = calculateTotalByProductType(ordersTodayPaid, 'Espelho');

  const totals = {
    totalOrdersFormatted: calculateTotal(ordersToday).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    totalOrders: calculateTotal(ordersToday), //valor total sem a formatação
    totalPaidAmountChatbotFormatted: calculateTotal(
      ordersToday.filter(
        order => order.payment_status === 'paid' && order.storefront === 'Loja',
      ),
    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmountEcomFormatted: calculateTotal(
      ordersToday.filter(
        order => order.payment_status === 'paid' && order.storefront !== 'Loja',
      ),
    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAllAmountEcomFormatted: calculateTotal(
      ordersToday.filter(order => order.storefront !== 'Loja'),
    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    totalPaidAmount: calculateTotal(
      ordersToday.filter(order => order.payment_status === 'paid'), //valor não formatado
    ),
    totalPaidAmountFormatted: calculateTotal(
      ordersToday.filter(order => order.payment_status === 'paid'),
    ),
    totalPaidAllAmountFormatted: calculateTotal(ordersAllToday).toLocaleString(
      'pt-BR',
      { style: 'currency', currency: 'BRL' },
    ),
    totalQuadrosFormatted: totalQuadros,
    totalEspelhosFormatted: totalEspelhos,
    totalPaidAmountChatbot: calculateTotal(
      ordersToday.filter(
        order =>
          order.payment_status === 'paid' &&
          order.storefront === 'Loja',
      ),
    ),
    totalPaidAllAmountEcom: calculateTotal(
      ordersToday.filter(
        order =>
          order.payment_status === 'paid' &&
          order.storefront !== 'Loja' &&
          order.storefront !== 'Loja Fisica',
      ),
    ),
    //calcula vendas da Loja Fisica
    totalRevenue: calculateTotal(
      ordersToday.filter(
        order =>
          order.payment_status === 'paid' && order.storefront === 'Loja Fisica',
      ),
    ),
    //calcula vendas da Loja Fisica de novos Clientes
    totalNovosClientes: calculateTotalClients(
      ordersToday.filter(
        order =>
          order.payment_status === 'paid' &&
          order.storefront === 'Loja Fisica' &&
          order.owner_note !== 'Chatbot' &&
          order.shipping_cost_owner !== 0,
      ),
    ),
    //calcula vendas da Loja Fisica de novos Clientes
    totalNovosClientesChatbot: calculateTotalClients(
      ordersToday.filter(
        order => order.payment_status === 'paid' && order.storefront === 'Loja',
      ),
    ),
    totalQuadros: calculateTotalByProductType(ordersTodayPaid, 'Quadro'),
    totalEspelhos: calculateTotalByProductType(ordersTodayPaid, 'Espelho'),
  };

  return {
    ordersToday,
    ordersTodayPaid,
    ordersAllToday,
    ordersAllTodayWithPartner,
    ...totals,
  };
}
