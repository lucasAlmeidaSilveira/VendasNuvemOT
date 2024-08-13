import React from "react";
import { useOrders } from "../../context/OrdersContext.jsx";
import { Logotipo } from "../Logo";
import { ButtonReload } from "../Reload";
import { Container } from "./styles.ts";
import { SwitchToggle } from "../SwitchToggle"; // Certifique-se de ajustar o caminho conforme necessário

export function Header() {
  const { store, setStore, resetData, setAutomaticUpdate } = useOrders();

  // Função para lidar com a mudança do select
  const handleStoreChange = (event) => {
    resetData();
    setStore(event.target.value);
  };

  const handleToggleAutomaticUpdate = () => {
    setAutomaticUpdate(prev => !prev);
  };

  return (
    <Container>
      <div className="div">
        <Logotipo store={store} />
        <div className="div-2">
          <div className="text-wrapper">Selecione uma loja</div>
          <select
            className="store-select"
            value={store}
            onChange={handleStoreChange}
          >
            <option value="outlet">Outlet dos Quadros</option>
            <option value="artepropria">Arte Própria</option>
          </select>
        </div>
      </div>
      <ButtonReload />
    </Container>
  );
}
