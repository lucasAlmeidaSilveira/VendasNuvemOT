import React from "react";
import { Container, ContainerOrders, ContainerPago, ContainerGeral } from "./styles";
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { Loading } from "../Loading";
import { useOrders } from "../../context/OrdersContext";
import { BestSellers } from "../BestSellers";
import { filterOrders } from "../../tools/filterOrders";

export function Dashboard() {
  const { allOrders, isLoading, date, setDate } = useOrders();
  const { ordersToday, ordersTodayPaid, totalOrdersFormatted, totalPaidAmountFormatted } = filterOrders(allOrders, date)

  return (
    <Container>
      <ContainerOrders>
        <ContainerPago>
          <div className="text-wrapper">Pago</div>
          <div className="div">
            <div className="text-wrapper-2">
            {isLoading ? (
              <Loading />
              ) : (
                `${ordersTodayPaid.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
              {isLoading ? (
                <Loading />
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
                <Loading />
              ) : (
                `${ordersToday.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
            {isLoading ? (
                <Loading />
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
