import React from "react";
import { Container, ContainerPago, ContainerGeral } from "./styles";
import { isOrderFromToday } from "../../tools/isOrderFromToday";

export function Dashboard({ orders }) {
  // Filtrar os pedidos da data de hoje
  const ordersToday = orders.filter((order) => isOrderFromToday(order.createdAt));

  // Total de todos os pedidos
  const totalOrders = ordersToday.reduce((total, order) => {
    const orderTotalNumber = parseFloat(order.total);
    return total + orderTotalNumber;
  }, 0);

  // Total formatado
  const totalOrdersFormatted = totalOrders.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Filtrar os pedidos com status "paid"
  const paidOrders = ordersToday.filter((order) => order.status === "paid");

  // Somar os valores totais dos pedidos com status "paid"
  const totalPaidAmount = paidOrders.reduce((total, order) => {
    return total + parseFloat(order.total); // Use parseFloat para garantir que os valores sejam somados corretamente
  }, 0);

  // Total de pedidos pagos formatado
  const totalPaidAmountFormatted = totalPaidAmount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Container>
      <ContainerPago>
        <div className="text-wrapper">Pago</div>
        <div className="div">
          <div className="text-wrapper-2">{paidOrders.length} Vendas</div>
          <div className="text-wrapper-3">{totalPaidAmountFormatted}</div>
        </div>
      </ContainerPago>
      <ContainerGeral>
        <div className="text-wrapper">Geral</div>
        <div className="div">
          <div className="text-wrapper-2">{ordersToday.length} Vendas</div>
          <div className="text-wrapper-3">{totalOrdersFormatted}</div>
        </div>
      </ContainerGeral>
    </Container>
  );
}
