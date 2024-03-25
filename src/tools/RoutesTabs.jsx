import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { Coupons } from '../components/Coupons';
import { Statistics } from '../components/Statistics';

export function RoutesTabs({ activeTab }) {
  switch (activeTab) {
    case 0:
      return <Dashboard />;
    case 1:
      return <Coupons />;
    case 2:
      return <Statistics />;
    // Você pode adicionar mais casos aqui para outras abas
    default:
      return <Dashboard />; // ou alguma página padrão
  }
}