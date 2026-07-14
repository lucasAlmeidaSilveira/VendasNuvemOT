import { getProduct } from '../api/db';
import { ProductRow } from '../types';

// =====================================================================
// Cache (memória) de catálogo por SKU para o BestSellers.
//
// orders_shop.products traz apenas SKUs; nome/preço/categoria/imagem vêm
// do catálogo via GET /db/product/:sku (uma chamada por SKU). O cache
// module-level deduplica e amortiza o custo entre períodos/renders — um
// SKU resolvido uma vez não é buscado de novo.
// =====================================================================

const cache = new Map<string, Promise<ProductRow | null>>();

function resolveOne(sku: string): Promise<ProductRow | null> {
  const key = String(sku).toLowerCase();
  if (!cache.has(key)) {
    cache.set(key, getProduct(sku).catch(() => null));
  }
  return cache.get(key) as Promise<ProductRow | null>;
}

// Limite de requisições /db/product simultâneas. Períodos amplos podem ter
// ~900 SKUs únicos (ex.: artepropria/mês); disparar tudo de uma vez floda a
// rede e arrisca timeouts (ainda mais com cold-start do Render). SKUs já em
// cache resolvem na hora e não contam contra o limite.
const MAX_CONCURRENCY = 8;

async function mapWithConcurrency<I, O>(
  items: I[],
  worker: (item: I) => Promise<O>,
  limit: number,
): Promise<O[]> {
  const results = new Array<O>(items.length);
  let cursor = 0;
  const run = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, run),
  );
  return results;
}

/**
 * Resolve uma lista de SKUs (deduplicados) no catálogo, com cache e
 * concorrência limitada. Retorna um Map<sku, ProductRow|null> usando os
 * SKUs originais.
 */
export async function resolveProducts(
  skus: string[],
): Promise<Map<string, ProductRow | null>> {
  const unique = Array.from(new Set(skus));
  const results = await mapWithConcurrency(
    unique,
    (sku) => resolveOne(sku),
    MAX_CONCURRENCY,
  );
  const map = new Map<string, ProductRow | null>();
  unique.forEach((sku, index) => map.set(sku, results[index]));
  return map;
}
