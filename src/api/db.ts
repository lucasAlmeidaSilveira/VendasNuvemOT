import { env } from '../utils/env';
import {
  DatabaseTable,
  FetchTableOptions,
  STORE_IDS,
  StoreName,
  CouponRow,
  ClientRow,
  ProductRow,
} from '../types';

// ---------------------------------------------------------------------------
// Service layer do novo backend (node-VendasNuvemOT)
//
// Rotas reais (src/routes/router.js):
//   GET /db/query/:querySelect/:store/:startDate/:endDate  (TODOS obrigatórios)
//   GET /db/coupon/:id
//   GET /db/client/:id
//   GET /db/product/:sku
//
// Regras de negócio importantes (controllers/segmentacaoControllers.js):
//   - O segmento :store é obrigatório no path e só é aceito para
//     orders_shop, daily_sales, ads e coupon; categorias/clientes respondem
//     com erro ("Filtro 'store' não suportado").
//   - store aceita nome amigável ('outlet'/'artepropria') ou ID numérico;
//     store não resolvível => [] (HTTP 200).
//   - Campos JSONB (coupons, products, markers_order_tiny, id_orders,
//     id_coupons, id_ads, order_ids) podem vir como string (às vezes
//     DUPLAMENTE codificada) OU já parseados — parseJsonbFields lida com todos.
// ---------------------------------------------------------------------------

// Colunas JSONB conhecidas em todas as tabelas
const JSONB_FIELDS = [
  'coupons',
  'products',
  'products_detail',
  'markers_order_tiny', // orders_shop
  'id_orders',
  'id_coupons',
  'id_ads', // daily_sales
  'order_ids', // coupon
];

/**
 * Garante que campos JSONB sejam arrays utilizáveis no frontend.
 * Aceita valor já parseado pelo driver, string JSON simples
 * (`["A"]`) ou string JSON DUPLAMENTE codificada — caso real observado
 * em orders_shop.coupons, que chega como `"\"[]\""`. Em qualquer caso,
 * cai para `[]` quando o valor é nulo/ausente/inválido.
 */
function parseJsonbFields<T extends Record<string, unknown>>(row: T): T {
  if (!row || typeof row !== 'object') return row;
  const parsed: Record<string, unknown> = { ...row };
  for (const field of JSONB_FIELDS) {
    let value = parsed[field];
    // Desfaz até 3 níveis de codificação JSON em string.
    let guard = 0;
    while (typeof value === 'string' && guard < 3) {
      try {
        value = JSON.parse(value);
      } catch {
        value = [];
        break;
      }
      guard += 1;
    }
    parsed[field] = value == null ? [] : value;
  }
  return parsed as T;
}

/** Converte nome amigável da loja para o ID numérico das tabelas que o usam. */
export function storeId(store: StoreName | string | number): number | undefined {
  if (typeof store === 'number') return store;
  return STORE_IDS[store as StoreName];
}

/**
 * Busca genérica numa tabela via /db/query.
 * Rota real: GET /db/query/:querySelect/:store/:startDate/:endDate.
 * store, startDate e endDate são OBRIGATÓRIOS no path (datas em YYYY-MM-DD).
 * store aceita nome amigável ('outlet'/'artepropria') ou ID numérico.
 */
export async function fetchTable<T = Record<string, unknown>>(
  table: DatabaseTable | string,
  options: FetchTableOptions = {},
): Promise<T[]> {
  const { startDate, endDate, store, signal } = options;

  if (!startDate || !endDate) {
    throw new Error(
      `A rota /db/query/${table} exige startDate e endDate (YYYY-MM-DD).`,
    );
  }
  if (store === undefined || store === null || store === '') {
    throw new Error(
      `A rota /db/query/${table} exige a loja (store) no path.`,
    );
  }

  const url = `${env.apiUrl}db/query/${table}/${encodeURIComponent(
    String(store),
  )}/${startDate}/${endDate}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      `Erro ao buscar "${table}" (${response.status} ${response.statusText})`,
    );
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((row) => parseJsonbFields(row as Record<string, unknown>)) as T[];
}

/**
 * Resposta da rota legada GET /analytics/:store/:startDate/:endDate.
 * O backend faz UMA query de range no GA4 (não soma dia a dia), então
 * `totalVisits`/`usersByDevice`/`carts` refletem o período inteiro numa
 * única contagem — semântica que reproduzimos aqui para bater com o legado.
 */
export interface AnalyticsRangeResult {
  totalVisits: number;
  usersByDevice: { mobile: number; desktop: number; tablet: number };
  carts: number;
  beginCheckout: number;
  totalCost?: Record<string, number>;
  formSubmits?: number;
}

/**
 * Sessões/carrinhos/dispositivos do período via query de range única (GA4).
 * Rota: GET /analytics/:store/:startDate/:endDate (mesmo backend do app).
 * Diferente de somar as linhas diárias da tabela `ads`, esta rota conta o
 * range de uma vez — evitando a sobrecontagem de sessões em períodos > 1 dia.
 */
export async function fetchAnalyticsRange(
  store: StoreName | string | number,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<AnalyticsRangeResult> {
  const url = `${env.apiUrl}analytics/${encodeURIComponent(
    String(store),
  )}/${startDate}/${endDate}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      `Erro ao buscar analytics de range (${response.status} ${response.statusText})`,
    );
  }
  return (await response.json()) as AnalyticsRangeResult;
}

/** Busca um cupom específico por id_coupon. */
export async function getCoupon(id: number | string): Promise<CouponRow | null> {
  const response = await fetch(`${env.apiUrl}db/coupon/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Erro ao buscar cupom ${id} (${response.status})`);
  }
  return parseJsonbFields((await response.json()) as Record<string, unknown>) as CouponRow;
}

/**
 * Busca um cliente por id_cli (numérico) ou cpf_cnpj_cli (texto).
 * Rota real verificada: GET /db/clients/:id (plural). A forma singular
 * /db/client/:id retorna 400 "Tabela inválida".
 */
export async function getClient(id: number | string): Promise<ClientRow | null> {
  const response = await fetch(`${env.apiUrl}db/clients/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Erro ao buscar cliente ${id} (${response.status})`);
  }
  const data = await response.json();
  // Resposta de erro vem como objeto { error: ... } com HTTP 200/400.
  if (!data || (data as { error?: string }).error) return null;
  return data as ClientRow;
}

// Vendas históricas por produto (all-time), por loja — já AGREGADO no backend
// reproduzindo a tela legada (agrupa por product_id, +1 por linha, faturamento
// pelo preço histórico da linha, variações por variant_values, TODOS os status).
// A fonte por linha é orders_shop.products_detail (enriquecida + backfill).
export interface ProductSalesRow {
  id: number | string;
  sku: string | null;
  skuNumber: string;
  name: string;
  image: string | null;
  sales: number;
  revenue: number;
  variantCount: Record<string, number>;
  variations: string;
}
export interface VariationRow {
  id: string;
  name: string;
  sales: number;
}
export interface ProductSalesResult {
  products: ProductSalesRow[];
  variations: VariationRow[];
}

/**
 * Vendas por produto (all-time), por loja. Rota: GET /db/product-sales/:store.
 * Sem filtro de data; o backend já devolve { products, variations } agregado.
 */
export async function fetchProductSales(
  store: StoreName | string | number,
): Promise<ProductSalesResult> {
  const response = await fetch(
    `${env.apiUrl}db/product-sales/${encodeURIComponent(String(store))}`,
  );
  if (!response.ok) {
    throw new Error(
      `Erro ao buscar vendas por produto (${response.status} ${response.statusText})`,
    );
  }
  const data = await response.json();
  return {
    products: Array.isArray(data?.products) ? data.products : [],
    variations: Array.isArray(data?.variations) ? data.variations : [],
  };
}

// ---------------------------------------------------------------------------
// Resolução em LOTE de catálogo e clientes.
//
// Antes, cada SKU custava um GET /db/product/:sku e cada pedido um
// GET /db/clients/:id — até ~900 e ~300 requisições num mês da artepropria.
// As rotas em lote resolvem tudo de uma vez.
//
// São POST porque há cod_categoria com vírgula na base (um separador em
// querystring quebraria) e a lista estoura o limite prático de URL.
// O servidor aceita até 200 itens por chamada; usamos 150 de folga.
// ---------------------------------------------------------------------------
const BATCH_LIMIT = 150;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function postBatch<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<Record<string, T | null>> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Erro em ${path} (${response.status} ${response.statusText})`);
  }
  return (await response.json()) as Record<string, T | null>;
}

/** Resolve vários SKUs de uma vez. As chaves do retorno são os SKUs enviados. */
export async function getProductsBatch(
  skus: string[],
  signal?: AbortSignal,
): Promise<Record<string, ProductRow | null>> {
  if (skus.length === 0) return {};
  const parts = await Promise.all(
    chunk(skus, BATCH_LIMIT).map((c) =>
      postBatch<ProductRow>('db/products/batch', { skus: c }, signal),
    ),
  );
  return Object.assign({}, ...parts);
}

/** Resolve vários clientes de uma vez (aceita id_cli serial ou cpf_cnpj_cli). */
export async function getClientsBatch(
  ids: (string | number)[],
  signal?: AbortSignal,
): Promise<Record<string, ClientRow | null>> {
  if (ids.length === 0) return {};
  const parts = await Promise.all(
    chunk(ids, BATCH_LIMIT).map((c) =>
      postBatch<ClientRow>('db/clients/batch', { ids: c }, signal),
    ),
  );
  return Object.assign({}, ...parts);
}

/** Busca um produto pelo SKU (cod_categoria). Aceita caixa baixa ou alta. */
export async function getProduct(sku: string): Promise<ProductRow | null> {
  const response = await fetch(`${env.apiUrl}db/product/${encodeURIComponent(sku)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Erro ao buscar produto ${sku} (${response.status})`);
  }
  return (await response.json()) as ProductRow;
}
