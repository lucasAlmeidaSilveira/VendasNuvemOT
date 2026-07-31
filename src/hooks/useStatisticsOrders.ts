import { useEffect, useState } from 'react';
import { fetchTable } from '../api/db';
import { resolveProducts } from './productCache';
import { fetchClientCached } from './clientCache';
import { useDatabaseContext } from '../context/DbContext';
import {
  DatabaseTable,
  OrderShop,
  ProductRow,
  ClientRow,
  ProductDetailShop,
} from '../types';
import { formatDate } from '../tools/tools';

// =====================================================================
// Replica a lógica do `tools/filterOrders` (legado) sobre `orders_shop`,
// para a aba Statistics imprimir o MESMO resultado do legado.
//
// O recorte por origem do pedido é o mesmo do legado, via `storefront`:
//   'Loja'        -> Chatbot
//   'Loja Fisica' -> Loja Física
//   demais/null   -> Ecom (Nuvemshop e Tiny; o Tiny grava storefront null)
// Nos pedidos manuais das duas primeiras origens, `shipping_cost_owner` não é
// frete: carrega o total de vendas de clientes (o `calculateTotalClients` do
// legado). Ver migrateShippingCostOwner.js no backend.
//
// Além dos totais monetários, devolve os ARRAYS de pedido (ordersToday,
// ordersAllToday, ordersTodayPaid) ADAPTADOS ao shape que as seções leem:
//  - payment_details.method  (= orders_shop.payment_method)  → DataSectionPay
//  - products[{name,price,quantity}] (catálogo) +
//    productCost (custo congelado do pedido)                  → DataSectionCosts
//  - coupon[{code,value}] (códigos; value indisponível='0')   → DataSectionCart
//  - billing_province (= client.uf_cli)                       → gráfico estados
// =====================================================================

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const brl = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const sumTotal = (orders: OrderShop[]): number =>
  orders.reduce((acc, o) => acc + num(o.total), 0);

// Só faz sentido em pedidos manuais: ali `shipping_cost_owner` guarda o total de
// vendas de clientes, não o frete (equivale ao calculateTotalClients do legado).
const sumOwner = (orders: OrderShop[]): number =>
  orders.reduce((acc, o) => acc + num(o.shipping_cost_owner), 0);

// Custo de produto do pedido: soma o custo CONGELADO de CADA LINHA de
// products_detail, sem join por SKU e sem multiplicar por quantidade — é a
// tradução literal do legado, que fazia
// `order.products.reduce((t, p) => t + (p.cost ? parseFloat(p.cost) : 0), 0)`
// sobre o array de linhas do próprio pedido.
//
// NÃO derivar isso de adaptProducts: lá o custo é agrupado por SKU e só sobrevive
// para os SKUs que também aparecem em `orders_shop.products`. Quando os dois
// arrays divergem (aconteceu com SKUs `...+410-...` x `...+412-...`), a linha some
// e o custo é descartado em silêncio. Aqui nada é descartado.
// Linha sem custo gravado (pedido manual/Loja Física, ou anterior ao backfill)
// vale 0, igual ao legado.
const sumFrozenCost = (detail?: ProductDetailShop[]): number =>
  Array.isArray(detail)
    ? detail.reduce((acc, line) => acc + num(line?.cost), 0)
    : 0;

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
  // Total autoritativo do custo do pedido (ver sumFrozenCost). É o que
  // DataSectionCosts soma; `products[].cost` é só o recorte por SKU.
  productCost: number;
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

// Agrupa SKUs repetidos e resolve no catálogo (nome/preço/quantidade).
//
// `cost` NÃO vem do catálogo: é o custo CONGELADO da venda, somado das linhas de
// products_detail daquele SKU. O catálogo (custo_categoria) é sobrescrito a cada
// webhook e foi achatado pelo migrateProductCost.js, então usá-lo reprecificava
// pedidos antigos e inflava o card "Custo de Produto" (~+4,7% no outlet em 2026).
//
// ATENÇÃO: este `cost` é o custo do SKU dentro do pedido, para exibição por
// produto — NÃO é o total do pedido. Linhas de products_detail cujo SKU não
// aparece em `orders_shop.products` não têm grupo para cair e ficam de fora.
// O total do pedido é `AdaptedOrder.productCost` (sumFrozenCost), que soma todas
// as linhas sem join nenhum, como o legado.
function adaptProducts(
  skus: string[],
  productMap: Map<string, ProductRow | null>,
  detail?: ProductDetailShop[],
): AdaptedProduct[] {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const sku of skus) {
    if (!counts.has(sku)) order.push(sku);
    counts.set(sku, (counts.get(sku) ?? 0) + 1);
  }

  // Custo congelado acumulado por SKU (products_detail é 1:1 com as linhas).
  const frozenCost = new Map<string, number>();
  if (Array.isArray(detail)) {
    for (const line of detail) {
      const sku = line?.sku;
      if (typeof sku !== 'string') continue;
      frozenCost.set(sku, (frozenCost.get(sku) ?? 0) + num(line.cost));
    }
  }

  return order.map((sku) => {
    const p = productMap.get(sku);
    return {
      sku,
      name: p?.desc_categoria || p?.nome_categoria || sku,
      price: p ? num(p.preco) : 0,
      cost: frozenCost.get(sku) ?? 0,
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
    products: adaptProducts(skus, productMap, o.products_detail),
    productCost: sumFrozenCost(o.products_detail),
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

  // Recorte por origem do pedido (mesmos predicados do filterOrders legado).
  const paidChatbot = paidRaw.filter((o) => o.storefront === 'Loja');
  const paidLojaFisica = paidRaw.filter((o) => o.storefront === 'Loja Fisica');
  const paidEcom = paidRaw.filter(
    (o) => o.storefront !== 'Loja' && o.storefront !== 'Loja Fisica',
  );

  const totalPaidAmountChatbot = sumTotal(paidChatbot);
  const adapt = (o: OrderShop) => adaptOrder(o, productMap, clientMap);

  return {
    ordersToday: todayRaw.map(adapt),
    ordersAllToday: allRaw.map(adapt),
    ordersTodayPaid: paidRaw.map(adapt),
    // Loja Física / Chatbot: totais de venda e a parcela de clientes (sumOwner).
    totalRevenue: sumTotal(paidLojaFisica),
    totalPaidAmountChatbot,
    totalPaidAmountChatbotFormatted: brl(totalPaidAmountChatbot),
    totalNovosClientes: sumOwner(paidLojaFisica),
    totalRecorrentesClientesChatbot: sumOwner(paidChatbot),
    // Ecom = tudo que NÃO é pedido manual.
    totalPaidAllAmountEcom: sumTotal(paidEcom),
    // Legado: Σ total de TODOS os pagos, manuais inclusive — NÃO é o Ecom.
    // Alimenta `totalOrdersFormatted` (DataSectionCosts e o ROAS do outlet).
    totalPaidAmountFormatted: sumTotal(paidRaw),
    totalPaidAllAmountFormatted: brl(sumTotal(allRaw)),
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
