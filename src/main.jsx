import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { OrdersProvider } from './context/OrdersContext'; // Importe o provedor do contexto de pedidos
import { TabProvider } from './context/TabContext'; // Importe o provedor do contexto de abas
import { CouponProvider } from './context/CouponsContext';
import { AnalyticsProvider } from './context/AnalyticsContext.tsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RefundsProvider } from './context/RefundsContext.tsx';
import { TikTokAdsProvider } from './context/TikTokAdsContext.tsx';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <OrdersProvider>
        <RefundsProvider>
          <TikTokAdsProvider>
            <TabProvider>
              <AnalyticsProvider>
                <CouponProvider>
                  <App />
                </CouponProvider>
              </AnalyticsProvider>
            </TabProvider>
          </TikTokAdsProvider>
        </RefundsProvider>
      </OrdersProvider>
    </AuthProvider>
  </React.StrictMode>,
);
