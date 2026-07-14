import React, {
  createContext,
  useReducer,
  useCallback,
  useContext,
  useState,
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

  // Busca dados de uma tabela do novo backend via /db/query.
  // Delega ao service layer (api/db.ts), que cuida da rota real, do filtro
  // de loja e do parse dos campos JSONB.
  const fetchData = useCallback(
    async (table: DatabaseTable, options: FetchTableOptions = {}) => {
      try {
        dispatch({ type: 'FETCH_START', table });

        const data = (await fetchTable<DatabaseData>(table, options)) ?? [];

        // Lista vazia é um estado válido (ex.: nenhum cupom no período),
        // não um erro — deixamos a UI exibir "nenhum registro".
        dispatch({ type: 'FETCH_SUCCESS', table, data });
      } catch (error: any) {
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
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  // Função para obter dados tipados
  const getCurrentData = useCallback(<T extends DatabaseData>(): T[] => {
    return state.data as T[];
  }, [state.data]);

  // Valor do contexto
  const contextValue: DatabaseContextType = {
    state,
    fetchData,
    clearData,
    getCurrentData,
    reloadKey,
    reloadData,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};
