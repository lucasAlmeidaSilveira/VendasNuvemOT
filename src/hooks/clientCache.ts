import { useEffect, useState } from 'react';
import { getClient } from '../api/db';
import { ClientRow } from '../types';

// =====================================================================
// Cache (memória) de clientes por id_cli para a tela Pedidos.
//
// orders_shop guarda apenas id_cli (numérico); nome/CPF/contato/endereço
// vêm de GET /db/clients/:id sob demanda. O cache module-level deduplica
// e amortiza entre linhas/expansões/renders.
// =====================================================================

const cache = new Map<string, Promise<ClientRow | null>>();

export function fetchClientCached(
  id: number | string,
): Promise<ClientRow | null> {
  const key = String(id);
  if (!cache.has(key)) {
    cache.set(key, getClient(id).catch(() => null));
  }
  return cache.get(key) as Promise<ClientRow | null>;
}

// Hook: resolve um cliente por id_cli (com cache).
export function useClient(id: number | string | undefined | null) {
  const [client, setClient] = useState<ClientRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id === undefined || id === null || id === '') {
      setClient(null);
      return;
    }
    let active = true;
    setLoading(true);
    fetchClientCached(id).then((c) => {
      if (!active) return;
      setClient(c);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return { client, loading };
}
