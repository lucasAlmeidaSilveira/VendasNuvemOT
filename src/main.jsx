import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { OrdersProvider } from './context/OrdersContext'; // Importe o provedor do contexto de pedidos
import { TabProvider } from './context/TabContext'; // Importe o provedor do contexto de abas
import { CouponProvider } from './context/CouponsContext';
import { AnalyticsProvider } from './context/AnalyticsContext.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <OrdersProvider>
      <TabProvider>
        <AnalyticsProvider>
          <CouponProvider>
            <App />
          </CouponProvider>
        </AnalyticsProvider>
      </TabProvider>
    </OrdersProvider>
  </React.StrictMode>,
);
