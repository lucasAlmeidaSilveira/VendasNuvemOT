import React from "react";
import { Container, ContainerOrders, ContainerPago, ContainerGeral } from "./styles";
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { Loading, LoadingIcon } from "../Loading";
import { useOrders } from "../../context/OrdersContext";
import { BestSellers } from "../BestSellers";
import { filterOrders } from "../../tools/filterOrders";

export function Dashboard() {
  const { allOrders, isLoading, isLoadingAllOrders, date, setDate } = useOrders();
  const { ordersToday, totalOrdersFormatted, totalPaidAmountFormatted, paidOrders } = filterOrders(allOrders, date)

  return (
    <Container>
      <ContainerOrders>
        <ContainerPago>
          <div className="text-wrapper">Pago</div>
          <div className="div">
            <div className="text-wrapper-2">
            {isLoading || isLoadingAllOrders ? (
              <LoadingIcon color={'#FCFAFB'} size={16}  />
              ) : (
                `${paidOrders.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
              {isLoading || isLoadingAllOrders ? (
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
            {isLoading || isLoadingAllOrders ? (
                <LoadingIcon color={'var(--geralblack-100)'} size={16}  />
              ) : (
                `${ordersToday.length} Vendas`
              )}
            </div>
            <div className="text-wrapper-3">
            {isLoading || isLoadingAllOrders ? (
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
