import React, {
  createContext,
  useReducer,
  useCallback,
  useContext,
  useState,
  useRef,
  useMemo,
} from 'react';

import {
  DatabaseContextType,
  DatabaseContextState,
  DatabaseAction,
  DatabaseProviderProps,
  DatabaseTable,
  DatabaseData,
  FetchTableOptions,
} from '../types';
import { fetchTable } from '../api/db';

// Estado inicial
const initialState: DatabaseContextState = {
  data: [],
  loading: false,
  error: null,
  currentTable: null,
};

// Reducer para gerenciar estado
function databaseReducer(
  state: DatabaseContextState,
  action: DatabaseAction,
): DatabaseContextState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
        currentTable: action.table,
        data: [], // Limpa dados anteriores durante o carregamento
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.data,
        currentTable: action.table,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.error,
        data: [],
      };

    case 'CLEAR_DATA':
      return {
        ...state,
        data: [],
        currentTable: null,
        error: null,
      };

    default:
      return state;
  }
}

// Criar o contexto
export const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined,
);

// Hook personalizado para usar o contexto
export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error(
      'useDatabaseContext deve ser usado dentro de DatabaseProvider',
    );
  }
  return context;
};

// Componente Provedor
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(databaseReducer, initialState);

  // Sinal de recarga manual (ButtonReload). Consumidores da base nova incluem
  // `reloadKey` nas deps do efeito de busca; `reloadData()` força o refetch.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadData = useCallback(() => setReloadKey((k) => k + 1), []);

  // Guarda de sequência + cancelamento.
  //
  // Dashboard, Pedidos e Cupons compartilham este ÚNICO estado. Sem guarda,
  // dois cliques rápidos no filtro de data deixavam duas requisições vivas e,
  // se a mais ANTIGA chegasse por último, ela virava `state.data` com
  // `loading: false` e `currentTable` batendo — a tela então exibia o período
  // errado como se fosse verdade, e só o botão de recarregar corrigia.
  //
  // `requestId` é monotônico: só a busca mais recente pode despachar. O
  // AbortController ainda cancela a requisição anterior na rede, para não
  // gastar banda com uma resposta que seria descartada de qualquer forma.
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (table: DatabaseTable, options: FetchTableOptions = {}) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const requestId = ++requestIdRef.current;
      const isStale = () => requestId !== requestIdRef.current;

      try {
        dispatch({ type: 'FETCH_START', table });

        const data =
          (await fetchTable<DatabaseData>(table, {
            ...options,
            signal: controller.signal,
          })) ?? [];

        if (isStale()) return; // uma busca mais nova assumiu

        // Lista vazia é um estado válido (ex.: nenhum cupom no período),
        // não um erro — deixamos a UI exibir "nenhum registro".
        dispatch({ type: 'FETCH_SUCCESS', table, data });
      } catch (error: any) {
        // Aborto é fluxo esperado (troca de período), não erro de verdade:
        // não pode apagar o estado de loading da busca que o substituiu.
        if (error?.name === 'AbortError' || isStale()) return;

        console.error('Erro ao buscar dados:', error);
        dispatch({
          type: 'FETCH_ERROR',
          error: error.message || 'Erro ao buscar dados do banco',
        });
      }
    },
    [],
  );

  // Função para limpar dados
  const clearData = useCallback(() => {
    // Invalida qualquer busca em voo: sem isso, uma resposta a caminho
    // repopularia o estado logo depois da limpeza.
    abortRef.current?.abort();
    requestIdRef.current += 1;
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  // Função para obter dados tipados
  const getCurrentData = useCallback(<T extends DatabaseData>(): T[] => {
    return state.data as T[];
  }, [state.data]);

  // Memoizado: sem isso um literal novo a cada render re-renderiza todos os
  // consumidores do contexto mesmo quando nada mudou.
  const contextValue = useMemo<DatabaseContextType>(
    () => ({
      state,
      fetchData,
      clearData,
      getCurrentData,
      reloadKey,
      reloadData,
    }),
    [state, fetchData, clearData, getCurrentData, reloadKey, reloadData],
  );

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};
