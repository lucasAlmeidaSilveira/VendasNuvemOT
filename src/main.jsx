import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { OrdersProvider } from "./context/OrdersContext"; // Importe o provedor do contexto de pedidos
import { TabProvider } from "./context/TabContext"; // Importe o provedor do contexto de abas
import { CouponProvider } from "./context/CouponsContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <OrdersProvider> {/* Envolver App com OrdersProvider */}
      <CouponProvider>
        <TabProvider> {/* Envolver App com TabProvider */}
          <App />
        </TabProvider>
      </CouponProvider>
    </OrdersProvider>
  </React.StrictMode>
);
