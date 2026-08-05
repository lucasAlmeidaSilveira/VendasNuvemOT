import { useEffect, useState } from 'react';
import { getClientsBatch } from '../api/db';
import { ClientRow } from '../types';

// =====================================================================
// Cache (memória) de clientes por id_cli para a tela Pedidos.
//
// orders_shop guarda apenas id_cli (numérico ou o CPF/CNPJ, dependendo do
// pedido); nome/CPF/contato/endereço vêm do backend. Antes era UMA
// requisição por id (GET /db/clients/:id) — e cada uma podia custar duas
// queries sequenciais no servidor. Na aba Estatísticas o disparo era sem
// limite de concorrência: milhares de requisições simultâneas em "Todo o
// período".
//
// Agora existe uma fila de micro-batching: todo fetchClientCached() emitido
// no MESMO tick vira um POST /db/clients/batch. Isso atende os dois padrões
// de uso sem alterar nenhum componente — o `ids.map` em massa do
// useStatisticsOrders e os useClient(id) individuais de cada linha da
// tabela, que o React monta num único commit.
//
// A API pública (fetchClientCached, useClient) NÃO mudou.
// =====================================================================

const cache = new Map<string, Promise<ClientRow | null>>();

let pending: string[] = [];
let resolvers = new Map<string, (value: ClientRow | null) => void>();
let scheduled = false;

function flush() {
  const ids = pending;
  const pendingResolvers = resolvers;
  pending = [];
  resolvers = new Map();
  scheduled = false;

  // getClientsBatch já fatia internamente no limite aceito pelo servidor.
  getClientsBatch(ids)
    .then((map) => ids.forEach((id) => pendingResolvers.get(id)?.(map[id] ?? null)))
    // Falha nunca propaga para a UI — mesmo comportamento do `.catch(() => null)`
    // anterior, com a diferença de que agora atinge o lote inteiro de uma vez.
    .catch(() => ids.forEach((id) => pendingResolvers.get(id)?.(null)));
}

export function fetchClientCached(
  id: number | string,
): Promise<ClientRow | null> {
  const key = String(id);
  if (!cache.has(key)) {
    cache.set(
      key,
      new Promise<ClientRow | null>((resolve) => {
        resolvers.set(key, resolve);
        pending.push(key);
        if (!scheduled) {
          scheduled = true;
          queueMicrotask(flush);
        }
      }),
    );
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
