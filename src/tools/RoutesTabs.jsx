import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { Coupons } from '../components/Coupons';
import { Statistics } from '../components/Statistics';
import { Orders } from '../components/Orders';
import { Products } from '../components/Products';
import { Deliveries } from '../components/Deliveries';


export function RoutesTabs({ activeTab }) {
  switch (activeTab) {
    case 0:
      return <Dashboard />;
    case 1:
      return <Orders />;
    case 2:
      return <Statistics />;
    case 3:
      return <Products />;
    case 4:
      return <Coupons />;
    case 5:
      return <Deliveries/>  
    // Você pode adicionar mais casos aqui para outras abas
    default:
      return <Dashboard />; // ou alguma página padrão
  }
}