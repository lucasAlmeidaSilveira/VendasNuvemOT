import { getProductsBatch } from '../api/db';
import { ProductRow } from '../types';

// =====================================================================
// Cache (memória) de catálogo por SKU para o BestSellers.
//
// orders_shop.products traz apenas SKUs; nome/preço/categoria/imagem vêm
// do catálogo. Antes era UMA requisição por SKU (GET /db/product/:sku),
// limitada a 8 simultâneas — com ~900 SKUs únicos num mês da artepropria
// isso virava ~113 ondas sequenciais de round-trip, o que dominava o
// tempo de carregamento da tela.
//
// Agora os SKUs ainda não cacheados vão em POST /db/products/batch, em
// blocos de 150. O cache module-level continua igual: um SKU resolvido
// uma vez não é buscado de novo, e a chave segue em caixa baixa.
//
// A API pública (resolveProducts) NÃO mudou — nenhum componente precisou
// ser alterado.
// =====================================================================

const cache = new Map<string, Promise<ProductRow | null>>();

const cacheKey = (sku: string) => String(sku).toLowerCase();

/**
 * Resolve uma lista de SKUs (deduplicados) no catálogo, com cache.
 * Retorna um Map<sku, ProductRow|null> usando os SKUs originais.
 */
export async function resolveProducts(
  skus: string[],
): Promise<Map<string, ProductRow | null>> {
  const unique = Array.from(new Set(skus));

  // Só busca o que ainda não está em cache. A deduplicação é pela chave de
  // cache, então dois SKUs que só diferem em caixa contam como um — mesmo
  // comportamento do resolveOne anterior.
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const sku of unique) {
    const key = cacheKey(sku);
    if (!cache.has(key) && !seen.has(key)) {
      seen.add(key);
      missing.push(sku);
    }
  }

  if (missing.length > 0) {
    // Uma promessa compartilhada por bloco: cada SKU do bloco deriva a sua
    // dela. Falha vira `null`, como no `.catch(() => null)` de antes.
    const pending = getProductsBatch(missing);
    for (const sku of missing) {
      cache.set(
        cacheKey(sku),
        pending.then((map) => map[sku] ?? null).catch(() => null),
      );
    }
  }

  const results = await Promise.all(
    unique.map((sku) => cache.get(cacheKey(sku)) as Promise<ProductRow | null>),
  );
  const map = new Map<string, ProductRow | null>();
  unique.forEach((sku, index) => map.set(sku, results[index]));
  return map;
}
