import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrders } from './OrdersContext';
import { RefundsContextData, RefundSummary, RefundItem } from '../types';
import { adjustDate } from '../tools/tools';

// Função para criar um summary vazio
const createEmptySummary = (): RefundSummary => ({
  totalRefunds: 0,
  totalValue: 0,
  categories: {
    Atraso: { count: 0, value: 0 },
    'Não gostou': { count: 0, value: 0 },
    Avaria: { count: 0, value: 0 },
    Outros: { count: 0, value: 0 },
    'Envio/Logistica': { count: 0, value: 0 },
    'Produção/Defeito - Quadros': { count: 0, value: 0 },
    'Produção/Defeito - Espelhos': { count: 0, value: 0 },
    'OP Errada': { count: 0, value: 0 },
    Extravio: { count: 0, value: 0 },
    Troca: { count: 0, value: 0 },
    'Compra errada': { count: 0, value: 0 },
  },
  type: {
    Reembolso: { count: 0, value: 0 },
    Reenvio: { count: 0, value: 0 },
  },
  type_refunds: {
    Total: { count: 0, value: 0 },
    Parcial: { count: 0, value: 0 },
    Reenvio: { count: 0, value: 0 },
  },
});

// Valor padrão do contexto
const defaultRefundsContext: RefundsContextData = {
  reembolsos: [],
  reenvios: [],
  summaryReembolsos: createEmptySummary(),
  summaryReenvios: createEmptySummary(),
  loading: true,
  error: null,
  fetchRefunds: () => {},
};

const RefundsContext = createContext<RefundsContextData>(defaultRefundsContext);

export const useRefunds = () => useContext(RefundsContext);

export const RefundsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { store, date } = useOrders();
  const [reembolsos, setReembolsos] = useState<RefundItem[]>([]);
  const [reenvios, setReenvios] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryReembolsos, setSummaryReembolsos] =
    useState<RefundSummary>(createEmptySummary());
  const [summaryReenvios, setSummaryReenvios] =
    useState<RefundSummary>(createEmptySummary());

  const createdAtMin = adjustDate(date[0]);
  const createdAtMax = adjustDate(date[1]);

  // Função para calcular o summary para um conjunto de dados
  const calculateSummary = (data: RefundItem[]): RefundSummary => {
    const summary = createEmptySummary();

    if (data.length > 0) {
      data.forEach((refund) => {
        if (refund.total === null || isNaN(parseFloat(refund.total))) return;

        const amount = parseFloat(refund.total);
        summary.totalRefunds += 1;
        summary.totalValue += amount;

        // Atualiza o tipo
        if (refund.type === 'Reembolso' || refund.type === 'Reenvio') {
          summary.type[refund.type].count += 1;
          summary.type[refund.type].value += amount;
        }

        // Atualiza a categoria
        const validCategories = Object.keys(summary.categories);
        const category = validCategories.includes(refund.category)
          ? refund.category
          : 'Outros';

        summary.categories[category].count += 1;
        summary.categories[category].value += amount;

        // Atualiza a categoria
        const validRefundType = Object.keys(summary.type_refunds);
        const refundType = validRefundType.includes(refund.type_refund)
          ? refund.type_refund
          : 'Outros';

        summary.type_refunds[refundType].count += 1;
        summary.type_refunds[refundType].value += amount;
      });
    }

    return summary;
  };

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);

    try {
      // Busca reembolsos
      const responseReembolsos = await fetch(
        `https://node-vendasnuvemot.onrender.com/refunds/${store}/Reembolso/${createdAtMin}/${createdAtMax}`,
      );

      if (!responseReembolsos.ok) throw new Error('Erro ao buscar reembolsos');
      const dataReembolsos: RefundItem[] = await responseReembolsos.json();
      setReembolsos(dataReembolsos);
      setSummaryReembolsos(calculateSummary(dataReembolsos));

      // Busca reenvios
      const responseReenvios = await fetch(
        `https://node-vendasnuvemot.onrender.com/refunds/${store}/Reenvio/${createdAtMin}/${createdAtMax}`,
      );

      if (!responseReenvios.ok) throw new Error('Erro ao buscar reenvios');
      const dataReenvios: RefundItem[] = await responseReenvios.json();
      setReenvios(dataReenvios);
      setSummaryReenvios(calculateSummary(dataReenvios));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!store || !date || date.length < 2) return;
    fetchRefunds();
  }, [store, date]);

  const reloadRefunds = () => {
    fetchRefunds();
  };

  const value = {
    reembolsos,
    reenvios,
    summaryReembolsos,
    summaryReenvios,
    loading,
    error,
    fetchRefunds,
    reloadRefunds,
  };

  return (
    <RefundsContext.Provider value={value}>{children}</RefundsContext.Provider>
  );
};
