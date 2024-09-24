import React from "react";
import { Container, ContainerOrders, ContainerPago, ContainerGeral } from "./styles";
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { Loading, LoadingIcon } from "../Loading";
import { useOrders } from "../../context/OrdersContext";
import { BestSellers } from "../BestSellers";
import { filterOrders } from "../../tools/filterOrders";

export function Dashboard() {
  const { allOrders, isLoading, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted, totalPaidAmountFormatted } = filterOrders(allOrders, date)

  return (
    <Container>
      <ContainerOrders>
        <ContainerPago>
          <div className="text-wrapper">Pago</div>
          <div className="div">
            <div className="text-wrapper-2">
            {isLoading ? (
              <LoadingIcon color={'#FCFAFB'} size={16}  />
              ) : (
                `${ordersToday.length} Vendas`
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
                <LoadingIcon color={'var(--geralblack-100)'} size={16}  />
              ) : (
                `${ordersToday.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
            {isLoading ? (
                <Loading color={'var(--geralblack-100)'} />
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
