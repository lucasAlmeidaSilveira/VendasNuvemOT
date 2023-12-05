import React from "react";
import { Container, ContainerPago,ContainerGeral } from "./styles";

export function Dashboard({orders}){
  const totalOrders = orders.reduce((total, order) =>{
    const orderTotalNumber = parseInt(order.total)
    return total + orderTotalNumber
  }, 0)

  const formattedTotal = totalOrders.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }); 




  return (
    <Container>
      <ContainerPago>
        <div className="text-wrapper">Pago</div>
        <div className="div">
          <div className="text-wrapper-2">10 Vendas</div>
          <div className="text-wrapper-3">{formattedTotal}</div>
        </div>
      </ContainerPago>
      <ContainerGeral>
        <div className="text-wrapper">Geral</div>
        <div className="div">
          <div className="text-wrapper-2">12 Vendas</div>
          <div className="text-wrapper-3">{formattedTotal}</div>
        </div>
      </ContainerGeral>
    </Container>
  )
}

