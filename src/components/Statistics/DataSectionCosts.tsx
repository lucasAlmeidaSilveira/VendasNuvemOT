import React, { useEffect, useState } from 'react';
import { BudgetItem } from './BudgetItem';
import { ContainerOrders, ContainerGeral } from './styles';
import { formatCurrency, parseCurrency } from '../../tools/tools';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useOrders } from '../../context/OrdersContext';
import { filterOrders } from '../../tools/filterOrders';

interface DataSectionTPagoProps {
  bgcolor: string;
  totalAdSpend: number;
  totalOrdersFormatted: number;
  isLoadingADSGoogle: boolean;
  isLoadingADSMeta: boolean;
}

export function DataSectionCosts({
  bgcolor,
  totalAdSpend,
  totalOrdersFormatted,
  isLoadingADSGoogle,
  isLoadingADSMeta,
}: DataSectionTPagoProps) {
  totalAdSpend = formatCurrency(totalAdSpend);

  const { data, isLoading: isLoadingAnalytics } = useAnalytics();
  const { orders, isLoading: isLoadingOrders, date } = useOrders();
  const { paidOrders } = filterOrders(orders, date);
  const [productCost, setProductCost] = useState('R$ 0,00');
  const [grossProfit, setGrossProfit] = useState('R$ 0,00');
  const [grossMargin, setGrossMargin] = useState('0%');
  const [contributionMargin, setContributionMargin] = useState('0%');
  const [productCostPercent, setProductCostPercent] = useState('0%');
  const [totalProfit, setTotalProfit] = useState('R$ 0,00');

  useEffect(() => {
    if (paidOrders.length > 0) {
      const totalProductCost = paidOrders.reduce((totalOrderCost, order) => {
        const orderProductCost = order.products.reduce(
          (productTotal, product) => {
            const cost = product.cost ? parseFloat(product.cost) : 0; // Verifica se o custo não é null
            return productTotal + cost;
          },
          0,
        );
        return totalOrderCost + orderProductCost;
      }, 0);

      setProductCost(formatCurrency(totalProductCost));

      const totalOrderValue = parseCurrency(totalOrdersFormatted);
      const grossProfitValue = totalOrderValue - totalProductCost;

      setGrossProfit(formatCurrency(grossProfitValue));

      // Calcular a Margem Bruta
      const grossMarginValue =
        totalOrderValue > 0 ? (grossProfitValue / totalOrderValue) * 100 : 0;
      setGrossMargin(grossMarginValue.toFixed(2) + '%');

      // Calcular a Margem Contribuição
      const contributionMarginValue =
        ((grossProfitValue - parseCurrency(totalAdSpend)) / grossProfitValue) *
        100;
      setContributionMargin(
        formatCurrency(contributionMarginValue.toFixed(2) + '%'),
      );

      // Calcular a Margem Contribuição
      const productCostPercentValue =
        (totalProductCost / totalOrderValue) * 100;
      setProductCostPercent(productCostPercentValue.toFixed(2) + '%');

      // Calcular o Lucro Líquido
      const adSpend = parseCurrency(totalAdSpend);
      const totalProfitValue = totalOrderValue - totalProductCost - adSpend;
      setTotalProfit(formatCurrency(totalProfitValue));
    }
  }, [paidOrders, data]);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>Custos</h4>
        <div className='row'>
          <BudgetItem
            title='Lucro Bruto'
            tooltip='Faturamento - Custo de Produto'
            value={grossProfit}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo de Produto'
            tooltip='Nuvemshop'
            value={productCost}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo ADS'
            tooltip='Google ADS + Meta ADS'
            value={totalAdSpend}
            isLoading={isLoadingADSGoogle}
          />
        </div>
        <div className='row'>
          <BudgetItem
            title='Margem Bruta (%)'
            tooltip='Lucro Bruto / Faturamento'
            value={grossMargin}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Custo de Produto (%)'
            tooltip='Custo de Produto / Faturamento'
            value={productCostPercent}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            title='Margem de Contribuição (%)'
            tooltip='Lucro Bruto - Custo ADS / Lucro Bruto'
            value={contributionMargin}
            isLoading={isLoadingOrders}
          />
        </div>
        <div className='row'>
          <BudgetItem
            title='Lucro líquido'
            tooltip='Faturamento - Custo de Produto - Custo ADS'
            value={totalProfit}
            isLoading={isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
