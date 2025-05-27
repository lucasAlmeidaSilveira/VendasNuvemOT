import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrders } from './OrdersContext'; // Importa o contexto de pedidos
import { RefundsContextData, RefundSummary } from '../types';
import { adjustDate } from '../tools/tools';

// Valor padrão para inicializar o contexto
const defaultRefundsContext: RefundsContextData = {
  refunds: [],
  summary: {
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
    },
  },
  loading: true,
  error: null,
};

// Criando o contexto com a interface
const RefundsContext = createContext<RefundsContextData>(defaultRefundsContext);

export const useRefunds = () => useContext(RefundsContext);

export const RefundsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { store, date } = useOrders();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<RefundSummary>(
    defaultRefundsContext.summary,
  );

  const createdAtMin = adjustDate(date[0]);
  const createdAtMax = adjustDate(date[1]);

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://node-vendasnuvemot.onrender.com/refunds/${store}/${createdAtMin}/${createdAtMax}`,
      );
      if (!response.ok) throw new Error('Erro ao buscar reembolsos');

      const data = await response.json();
      setRefunds(data);

      // 🔹 Reinicializa o summary antes de processar os novos dados
      let updatedSummary: RefundSummary = {
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
        },
      };

      if (data.length > 0) {
        updatedSummary = data.reduce(
          (
            acc: RefundSummary,
            refund: { category: string; total: string | null },
          ) => {
            if (refund.total === null || isNaN(parseFloat(refund.total))) {
              return acc; // Ignora valores nulos ou inválidos
            }

            const amount = parseFloat(refund.total);
            acc.totalRefunds += 1;
            acc.totalValue += amount;

            const category = [
              'Atraso',
              'Não gostou',
              'Avaria',
              'Envio/Logistica',
              'Produção/Defeito - Quadros',
              'Produção/Defeito - Espelhos',
              'OP Errada',
            ].includes(refund.category)
              ? refund.category
              : 'Outros';

            acc.categories[category].count += 1;
            acc.categories[category].value += amount;

            return acc;
          },
          updatedSummary, // Usa o estado zerado como base
        );
      }

      setSummary(updatedSummary);
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

  // Função para ser chamada manualmente após cadastro de um reembolso
  const reloadRefunds = () => {
    fetchRefunds();
  };

  const value = { refunds, summary, loading, error, reloadRefunds };

  return (
    <RefundsContext.Provider value={value}>{children}</RefundsContext.Provider>
  );
};
