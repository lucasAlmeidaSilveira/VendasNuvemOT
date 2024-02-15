import React, { useState } from "react";
import { Container, ContainerOrders, ContainerPago, ContainerGeral } from "./styles";
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { isOrderOnDate } from "../../tools/isOrderFromToday";
import { Loading, LoadingIcon } from "../Loading";
import { FilterDate } from "../FilterDate";
import { useOrders } from "../../context/OrdersContext";
import { BestSellers } from "../BestSellers";
import { Oval } from "react-loader-spinner";

type ValuePiece = Date | null;

type Value = [ValuePiece, ValuePiece];

export function Dashboard() {
  const { orders, isLoading, date, setDate } = useOrders();
    
  // Filtrar os pedidos da data de hoje
  const ordersToday = orders.filter((order) => isOrderOnDate(order.createdAt, date) && (order.statusOrder !== "cancelled" && order.status !== "voided"))
  
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

  // Filtrar os pedidos com status "Pago"
  const paidOrders = ordersToday.filter((order) => order.status === "paid");

  // Somar os valores totais dos pedidos com status "Pago"
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
      <FilterDate onChange={setDate} value={date}/>
      <ContainerOrders>
        <ContainerPago>
          <div className="text-wrapper">Pago</div>
          <div className="div">
            <div className="text-wrapper-2">
            {isLoading ? (
              <LoadingIcon color={'#FCFAFB'} size={16}  />
              ) : (
                `${paidOrders.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
              {isLoading ? (
                <Loading color={'#FCFAFB'} />
                ) : (
                  totalPaidAmountFormatted
                )
              }
            </div>
          </div>
        </ContainerPago>
        <ContainerGeral>
          <div className="text-wrapper">Geral</div>
          <div className="div">
            <div className="text-wrapper-2">
            {isLoading ? (
                <LoadingIcon color={'#1F1F1F'} size={16}  />
              ) : (
                `${ordersToday.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
            {isLoading ? (
                <Loading color={'#1F1F1F'} />
                ) : (
                  totalOrdersFormatted
                )
              }
              </div>
          </div>
        </ContainerGeral>
      </ContainerOrders>

      <BestSellers />
    </Container>
  );
}
