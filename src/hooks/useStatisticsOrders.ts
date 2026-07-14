import { useEffect, useState } from 'react';
import { fetchTable } from '../api/db';
import { resolveProducts } from './productCache';
import { fetchClientCached } from './clientCache';
import { useDatabaseContext } from '../context/DbContext';
import { DatabaseTable, OrderShop, ProductRow, ClientRow } from '../types';
import { formatDate } from '../tools/tools';

// =====================================================================
// Replica a lógica do `tools/filterOrders` (legado) sobre `orders_shop`,
// para a aba Statistics imprimir o MESMO resultado do legado.
//
// orders_shop só tem pedidos de ECOMMERCE — as parcelas de storefront
// (Loja Física / Chatbot) do filterOrders foram descontinuadas e retornam 0.
//
// Além dos totais monetários, devolve os ARRAYS de pedido (ordersToday,
// ordersAllToday, ordersTodayPaid) ADAPTADOS ao shape que as seções leem:
//  - payment_details.method  (= orders_shop.payment_method)  → DataSectionPay
//  - products[{name,price,cost,quantity}] (catálogo)          → DataSectionCosts
//  - coupon[{code,value}] (códigos; value indisponível='0')   → DataSectionCart
//  - billing_province (= client.uf_cli)                       → gráfico estados
// =====================================================================

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const brl = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface AdaptedProduct {
  sku: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

export type AdaptedOrder = Omit<OrderShop, 'products'> & {
  id: number;
  contact_name: string;
  payment_details: { method: string | null };
  coupon: Array<{ code: string; value: string }>;
  products: AdaptedProduct[];
  billing_province: string | null;
};

export interface StatisticsOrdersResult {
  ordersToday: AdaptedOrder[];
  ordersAllToday: AdaptedOrder[];
  ordersTodayPaid: AdaptedOrder[];
  totalRevenue: number;
  totalPaidAmountFormatted: number;
  totalPaidAllAmountFormatted: string;
  totalPaidAmountChatbot: number;
  totalPaidAmountChatbotFormatted: string;
  totalPaidAllAmountEcom: number;
  totalQuadros: number;
  totalEspelhos: number;
  totalNovosClientes: number;
  totalRecorrentesClientesChatbot: number;
}

const EMPTY: StatisticsOrdersResult = {
  ordersToday: [],
  ordersAllToday: [],
  ordersTodayPaid: [],
  totalRevenue: 0,
  totalPaidAmountFormatted: 0,
  totalPaidAllAmountFormatted: brl(0),
  totalPaidAmountChatbot: 0,
  totalPaidAmountChatbotFormatted: brl(0),
  totalPaidAllAmountEcom: 0,
  totalQuadros: 0,
  totalEspelhos: 0,
  totalNovosClientes: 0,
  totalRecorrentesClientesChatbot: 0,
};

// Cache do fetch de orders_shop por (store|start|end) — várias seções chamam
// o hook com os mesmos parâmetros; evita refetch. Produtos/clientes já têm
// cache próprio (productCache/clientCache).
const ordersCache = new Map<string, Promise<OrderShop[]>>();
function fetchOrdersShop(
  store: string,
  start: string,
  end: string,
  reloadKey = 0,
): Promise<OrderShop[]> {
  // reloadKey no cache-key: cada recarga manual gera um fetch fresco.
  const key = `${store}|${start}|${end}|${reloadKey}`;
  if (!ordersCache.has(key)) {
    ordersCache.set(
      key,
      fetchTable<OrderShop>(DatabaseTable.ORDERS_SHOP, {
        store,
        startDate: start,
        endDate: end,
      }).then((rows) => rows ?? []),
    );
  }
  return ordersCache.get(key) as Promise<OrderShop[]>;
}

// Agrupa SKUs repetidos e resolve no catálogo (nome/preço/custo/quantidade).
function adaptProducts(
  skus: string[],
  productMap: Map<string, ProductRow | null>,
): AdaptedProduct[] {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const sku of skus) {
    if (!counts.has(sku)) order.push(sku);
    counts.set(sku, (counts.get(sku) ?? 0) + 1);
  }
  return order.map((sku) => {
    const p = productMap.get(sku);
    return {
      sku,
      name: p?.desc_categoria || p?.nome_categoria || sku,
      price: p ? num(p.preco) : 0,
      cost: p ? num(p.custo_categoria) : 0,
      quantity: counts.get(sku) ?? 1,
    };
  });
}

function adaptOrder(
  o: OrderShop,
  productMap: Map<string, ProductRow | null>,
  clientMap: Map<string, ClientRow | null>,
): AdaptedOrder {
  const skus = Array.isArray(o.products) ? o.products : [];
  const coupons = Array.isArray(o.coupons) ? o.coupons : [];
  // Desestrutura para excluir `products`, que será sobreescrito com tipo diferente.
  // `coupons` (string[]) é preservado — ClientDetailsShop lê os códigos brutos.
  const { products: _p, ...rest } = o;
  const client = clientMap.get(String(o.id_cli));
  return {
    ...rest,
    coupons,
    id: o.order_id,
    contact_name: client?.nome_cli ?? '',
    payment_details: { method: o.payment_method },
    // value por cupom não existe no orders_shop → '0' (códigos servem p/ categorizar).
    coupon: coupons.map((code) => ({ code, value: '0' })),
    products: adaptProducts(skus, productMap),
    billing_province: client?.uf_cli ?? null,
  };
}

function compute(
  rows: OrderShop[],
  productMap: Map<string, ProductRow | null>,
  clientMap: Map<string, ClientRow | null>,
): StatisticsOrdersResult {
  // filterOrders: exclui método 'other' (parcerias) sempre.
  const allRaw = rows.filter((o) => o.payment_method !== 'other');
  // ordersToday: também exclui cancelado (active=0) e estornado (voided).
  const todayRaw = allRaw.filter(
    (o) => Number(o.active) === 1 && o.payment_status !== 'voided',
  );
  const paidRaw = todayRaw.filter((o) => o.payment_status === 'paid');

  // Totais por tipo de produto (catálogo), só dos pedidos pagos.
  let totalQuadros = 0;
  let totalEspelhos = 0;
  for (const order of paidRaw) {
    const skus = Array.isArray(order.products) ? order.products : [];
    for (const sku of skus) {
      const product = productMap.get(sku);
      const src = product
        ? `${product.nome_categoria || ''} ${product.desc_categoria || ''}`.toLowerCase()
        : '';
      if (src.includes('produto')) continue; // placeholder Loja Física
      const price = product ? num(product.preco) : 0;
      if (src.includes('quadro')) totalQuadros += price;
      if (src.includes('espelho')) totalEspelhos += price;
    }
  }

  const totalPaidEcom = paidRaw.reduce((a, o) => a + num(o.total), 0);
  const adapt = (o: OrderShop) => adaptOrder(o, productMap, clientMap);

  return {
    ordersToday: todayRaw.map(adapt),
    ordersAllToday: allRaw.map(adapt),
    ordersTodayPaid: paidRaw.map(adapt),
    // Loja Física / Chatbot (storefront) descontinuados → 0.
    totalRevenue: 0,
    totalPaidAmountChatbot: 0,
    totalPaidAmountChatbotFormatted: brl(0),
    totalNovosClientes: 0,
    totalRecorrentesClientesChatbot: 0,
    // Ecom (= todos os pedidos do orders_shop).
    totalPaidAmountFormatted: totalPaidEcom,
    totalPaidAllAmountEcom: totalPaidEcom,
    totalPaidAllAmountFormatted: brl(allRaw.reduce((a, o) => a + num(o.total), 0)),
    totalQuadros,
    totalEspelhos,
  };
}

export function useStatisticsOrders(
  store: string,
  date: [Date, Date] | undefined,
) {
  const [result, setResult] = useState<StatisticsOrdersResult>(EMPTY);
  const [loading, setLoading] = useState(true);
  const { reloadKey } = useDatabaseContext();

  const start = date?.[0] ? formatDate(date[0]) : undefined;
  const end = date?.[1] ? formatDate(date[1]) : undefined;

  useEffect(() => {
    if (!store || !start || !end) return;
    let active = true;
    setLoading(true);

    (async () => {
      const rows = await fetchOrdersShop(store, start, end, reloadKey);

      const skus = [
        ...new Set(
          rows.flatMap((o) => (Array.isArray(o.products) ? o.products : [])),
        ),
      ];
      const ids = [...new Set(rows.map((o) => o.id_cli))];

      const [productMap, clientEntries] = await Promise.all([
        resolveProducts(skus),
        Promise.all(
          ids.map(
            async (id) =>
              [String(id), await fetchClientCached(id)] as [
                string,
                ClientRow | null,
              ],
          ),
        ),
      ]);
      const clientMap = new Map<string, ClientRow | null>(clientEntries);

      if (!active) return;
      setResult(compute(rows, productMap, clientMap));
      setLoading(false);
    })().catch(() => {
      if (!active) return;
      setResult(EMPTY);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [store, start, end, reloadKey]);

  return { ...result, loading };
}
