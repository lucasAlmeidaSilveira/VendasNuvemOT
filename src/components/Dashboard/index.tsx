import React from "react";
import { Container, ContainerPago,ContainerGeral } from "./styles";

export function Dashboard(){
return (
  <Container>
    <ContainerPago>
      <div className="text-wrapper">Pago</div>
      <div className="div">
        <div className="text-wrapper-2">10 Vendas</div>
        <div className="text-wrapper-3">R$ 1.734,00</div>
      </div>
    </ContainerPago>
    <ContainerGeral>
      <div className="text-wrapper">Geral</div>
      <div className="div">
        <div className="text-wrapper-2">12 Vendas</div>
        <div className="text-wrapper-3">R$ 2.614,00</div>
      </div>
    </ContainerGeral>
  </Container>
)
}

