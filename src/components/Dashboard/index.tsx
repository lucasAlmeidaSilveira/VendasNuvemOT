import React, { useState } from "react";
import { Container, ContainerOrders, ContainerPago, ContainerGeral } from "./styles";
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { isOrderOnDate } from "../../tools/isOrderFromToday";
import { Loading, LoadingIcon } from "../Loading";
import { FilterDate } from "../FilterDate";
import { useOrders } from "../../context/OrdersContext";
import { BestSellers } from "../BestSellers";
import { filterOrders } from "../../tools/filterOrders";

type ValuePiece = Date | null;

type Value = [ValuePiece, ValuePiece];

export function Dashboard() {
  const { orders, isLoading, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted, totalPaidAmountFormatted, paidOrders } = filterOrders(orders, date)

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
