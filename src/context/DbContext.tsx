import React, {
  createContext,
  useReducer,
  useCallback,
  useContext,
} from 'react';

import {
  DatabaseContextType,
  DatabaseContextState,
  DatabaseAction,
  DatabaseProviderProps,
  DatabaseTable,
  DatabaseData,
} from '../types';

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
  // Importar a função fetchRequest - ajuste o caminho conforme necessário
  const fetchRequest = async (table: string): Promise<any[]> => {
    const url = `http://localhost:8000/dbquery/${table}`;

    // Esta é uma importação dinâmica para evitar problemas de circular dependency
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  };

  // Função para buscar dados
  const fetchData = useCallback(async (table: DatabaseTable) => {
    try {
      dispatch({ type: 'FETCH_START', table });

      const data = await fetchRequest(table);

      if (data && data.length > 0) {
        dispatch({ type: 'FETCH_SUCCESS', table, data });
      } else {
        dispatch({ type: 'FETCH_ERROR', error: 'Nenhum dado encontrado' });
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      dispatch({
        type: 'FETCH_ERROR',
        error: error.message || 'Erro ao buscar dados do banco',
      });
    }
  }, []);

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
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};
