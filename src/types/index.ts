import { ReactNode } from 'react';

export interface DataSectionTPagoProps {
  title: string;
  bgcolor: string;
  verba: Verba;
  totalOrdersFormatted: number;
  isLoadingADSGoogle: boolean;
  isLoadingOrders: boolean;
  isLoadingADSMeta: boolean;
}

export interface DataSectionTPagoAPProps {
  title: string;
  bgcolor: string;
  verba: Verba;
  totalOrdersFormatted: number;
  isLoadingADSGoogle: boolean;
  isLoadingOrders: boolean;
  isLoadingADSMeta: boolean;
}

type Verba = {
  google: number;
  googleEcom: number;
  googleQuadros: number;
  googleEspelhos: number;
  googleLoja: number;
  googleGeral: number;
  meta: number;
  metaEcom: number;
  metaChatbot: number;
  metaQuadros: number;
  metaEspelhos: number;
  metaInstagram: number;
  metaGeral: number;
};

export interface DataSectionCartProps {
  bgcolor: string;
}

export interface DataSectionCartProps {
  bgcolor: string;
  totalAdSpend: number;
}

export interface DataSectionPayProps {
  bgcolor: string;
}

export interface DataSectionCostsProps {
  bgcolor: string;
  totalAdSpend: number | string;
  totalOrdersFormatted: number;
  isLoadingADSGoogle: boolean;
  isLoadingADSMeta: boolean;
}

export interface DataSectionAnalyticsProps {
  bgcolor: string;
  totalAdSpend: number;
}

export interface PlanilhaAnalyticsProps {
  bgcolor: string; // Cor de fundo do componente
  ordersToday: Array<{
    contact_name: string;
    total: string;
    billing_name: string;
  }>; // Lista de pedidos no formato esperado
  isLoadingPlanilha: boolean;
}

export interface Coupon {
  code: string;
  used: number;
  value: string;
}

export interface Order {
  id: string;
  order_id: string;
  owner_note: string;
  contact_name: string;
  products: [];
  gateway_link: string;
  status: string;
  shipping: string;
  shipping_status: string;
  shipping_min_days: number;
  shipping_max_days: number;
  payment_details: {
    method: string;
  };
  payment_status: string;
  created_at: string;
  paid_at: string;
  total: string;
  coupon: Coupon[];
}

export interface Creatives {
  id: number | string;
  cost: number;
  click: number;
  impression: number;
  conversions: number;
}

export interface Refunds {
  id: number | string;
  order_id: number | string;
  category: string;
  type_refund: string;
  created_at: string;
  total: number | string;
}
export interface CouponProps {
  code: string;
  id: number;
  type: string;
  used: number;
  value: string;
}

// Analytics

export interface ADSMetaEntry {
  account_id: string;
  totalCost: TotalCostMeta;
  impressions: number;
}

export type TotalCostMeta = {
  all: number;
  ecom: number;
  quadros: number;
  espelhos: number;
  instagram: number;
  chatbot: number;
  geral: number;
};

export type TotalCostGoogle = {
  all: number;
  ecom: number;
  quadros: number;
  espelhos: number;
  loja: number;
  chatbot: number;
  geral: number;
};

export type UsersByDevice = {
  mobile: number;
  desktop: number;
  tablet: number;
};

export interface DataProps {
  totalVisits: number;
  usersByDevice: UsersByDevice;
  totalCost: TotalCostGoogle;
  carts: number;
  beginCheckout: number;
}

export interface DataAnalyticsProps {
  data: DataProps;
  dataADSMeta: ADSMetaEntry[];
  isLoadingADSGoogle: boolean;
  isLoadingADSMeta: boolean;
  errorGoogle: boolean;
  errorMeta: boolean;
  resetData: () => void;
  fetchDataGoogle: () => void;
  fetchDataADSMeta: () => void;
}

export interface AnalyticsProviderProps {
  children: ReactNode;
}

export interface BudgetItemListProps {
  icon?: React.ElementType;
  iconColor?: string;
  dataCosts?: DataCosts[];
  small?: number | string;
  info?: string;
  title: string;
  value: number | string;
  isLoading: boolean;
  tooltip?: string;
  handleAction?: () => void;
  orders?: any[];
  error?: boolean;
  creatives?: Creatives[];
  refunds?: Refunds[];
}

export interface BudgetItemProps {
  icon?: React.ElementType;
  iconColor?: string;
  bullet?: string;
  small?: string | number;
  info?: string;
  title: string;
  value: number | string;
  isLoading: boolean;
  tooltip?: string;
  orders?: any[];
  creatives?: Creatives[];
  refunds?: Refunds[];
}

export interface DataCosts {
  quantity?: number | string;
  name: string;
  value: number | string;
}

export interface Category {
  name: string;
  value: number;
}

export interface Cost {
  name: string;
  value: number;
}

// Definição da interface para o contexto de reembolsos
export interface RefundCategory {
  count: number;
  value: number;
}
export interface RefundSummary {
  totalRefunds: number;
  totalValue: number;
  categories: {
    Atraso: RefundCategory;
    'Não gostou': RefundCategory;
    'Envio/Logistica': RefundCategory;
    'Produção/Defeito - Quadros': RefundCategory;
    'Produção/Defeito - Espelhos': RefundCategory;
    'OP Errada': RefundCategory;
    Avaria: RefundCategory;
    Outros: RefundCategory;
    Extravio: RefundCategory;
    Troca: RefundCategory;
    'Compra errada': RefundCategory;
  };
  type: {
    Reembolso: RefundCategory;
    Reenvio: RefundCategory;
  };
  type_refunds: {
    Total: RefundCategory;
    Parcial: RefundCategory;
    Reenvio: RefundCategory;
  };
}

export interface RefundItem {
  id: number;
  order_id: number;
  category: string;
  total: string;
  created_at: string;
  deleted: boolean;
  type: 'Reembolso' | 'Reenvio';
  type_refund: 'Total' | 'Parcial' | 'Reenvio';
}

export interface RefundsContextData {
  reembolsos: RefundItem[];
  reenvios: RefundItem[];
  summaryReembolsos: RefundSummary;
  summaryReenvios: RefundSummary;
  loading: boolean;
  error: null;
  //currentType: string | null;
  fetchRefunds: () => void;
}

export type TotalCostTikTokAds = {
  all: number;
};

export type TotalCostTikTokProps = {
  totalCost: TotalCostTikTokAds;
};

export interface TikTokAdsContextType {
  adsData: TotalCostTikTokProps; // Resposta da API
  loading: boolean; // Estado de carregamento
  error: string | null; // Mensagem de erro
  fetchTikTokAds: () => void; // Função para buscar dados ADS
  fetchTikTokCreatives: () => void; // Função para buscar dados dos criativos
  totalCostTikTokAll: number; // Valor de "all" (não pode ser null)
  allFullCreatives?: Creatives[];
}
export interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
}

// Interface para os dados de entrega da Mandae
export interface Delivery {
  id: string;
  order_id: string;
  store: string;
  name_client: string;
  lastDate: string; // Formato ISO 8601
  rastreio: string;
  linkRastreio: string;
  total: string;
  status: string;
  statusEntrega: string;
}

// Tipos para os parâmetros de busca da Mandae
/*export interface FetchParams {
  store: string;
  startDate: string; // Formato YYYY-MM-DD
  endDate: string;   // Formato YYYY-MM-DD
}*/
export interface FetchParams {
  store: string;
}

// Estado do contexto da Mandae
export interface MandaeContextType {
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  fetchDeliveries: (params: FetchParams) => Promise<void>;
  clearDeliveries: () => void;
}

// Props do Provider
export interface MandaeProviderProps {
  children: ReactNode;
  apiBaseUrl?: string; // Opcional para personalização
}


// =====================================================================
// Tipos do novo backend (rota GET /db/query/:querySelect/:startDate/:endDate)
// Refletem o shape REAL retornado pelos controllers de segmentação em
// node-VendasNuvemOT/src/db/dataBaseQueryList.js (dataBaseDb.*.transform).
// IMPORTANTE: as datas (startDate/endDate) são OBRIGATÓRIAS na rota e o
// filtro ?store= só é aceito para orders_shop, daily_sales e ads.
// =====================================================================

// Mapa loja -> ID numérico (usado em orders_shop, daily_sales)
export const STORE_IDS = {
  outlet: 3889735,
  artepropria: 1146504,
} as const;

export type StoreName = keyof typeof STORE_IDS;

// Tabelas que aceitam o segmento :store na rota /db/query (demais retornam erro)
export const STORE_FILTERABLE_TABLES = [
  'orders_shop',
  'daily_sales',
  'ads',
  'coupon',
];

// Linha a linha do pedido em orders_shop.products_detail. Enquanto `products` guarda só os
// SKUs, aqui ficam os campos que a tela legada de Produtos usava.
export interface ProductDetailShop {
  product_id: number | null;
  sku: string;
  name: string | null;
  price: number;
  // Custo CONGELADO no momento da venda — o mesmo campo que a base legada guardava
  // em pedidos_<loja>.products[].cost e que o card "Custo de Produto" somava por
  // linha. Não confundir com ProductRow.custo_categoria, que é o custo ATUAL do
  // catálogo (sobrescrito a cada webhook) e reprecifica pedidos antigos.
  // `undefined` = pedido sem custo gravado (manual/Loja Física ou anterior ao
  // backfill) e vale 0, exatamente como o legado imprimia.
  cost?: number;
  image: string | null;
  variant_values: string[];
  // Só é gravado em pedidos de loja física: guarda a QUANTIDADE DE CLIENTES do dia,
  // que é o número que a listagem legada imprimia na coluna Produtos.
  quantity?: number;
}

export interface OrderShop {
  order_id: number;
  id_cli: number | string;
  store: number;
  total: number;
  subtotal: number;
  payment_status: string | null;
  coupons: string[]; // jsonb -> array de códigos de cupom
  coupon_discount: number;
  products: string[]; // jsonb -> array de SKUs
  products_detail?: ProductDetailShop[]; // jsonb -> linhas do pedido (aditivo a `products`)
  shipping_option: string | null;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
  active: number;
  // Origem do pedido: 'Loja'/'Loja Fisica' = manual (loja física / chatbot),
  // 'store'/'mobile'/'form' = Nuvemshop, null = Tiny.
  storefront: string | null;
  shipping_status: string | null;
  gateway_link: string | null;
  payment_method: string | null;
  url_tracking: string | null;
  markers_order_tiny: string[]; // jsonb -> array de marcadores
  fiscal_note: string | null;
  estimated_delivery: string | null;
  shipping_cost: number;
  // Frete pago pela loja. Em pedidos manuais ('Loja'/'Loja Fisica') o campo é
  // reaproveitado para o total de vendas de clientes (novos na Loja Física,
  // recorrentes no Chatbot) — ver useStatisticsOrders.
  shipping_cost_owner: number | null;
  order_tracking_link: string | null;
}

export interface DailySale {
  id_sales: number;
  date_sales: string;
  store: number;
  total_orders: number;
  total_paid_orders: number;
  total_money: number;
  total_paid_money: number;
  aov: number;
  id_orders: number[]; // jsonb
  id_coupons: number[]; // jsonb
  id_ads: number[]; // jsonb
  active: number;
  dt_att_active: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdsRow {
  id_ads: number;
  date_ads: string;
  plataform: string; // 'Meta' | 'Google'
  store: string; // texto: 'outlet' | 'artepropria'
  funding_ecom: number;
  funding_store: number;
  funding_general: number;
  funding_chatbot: number;
  funding_insta: number;
  funding_mirror: number;
  funding_painting: number;
  active: number;
  // Colunas de analytics/conversão (preenchidas nas linhas Google) + verba total
  // e impressões (Meta). Alimentam o AnalyticsContext a partir da base nova.
  funding_all?: number;
  total_visits?: number;
  users_by_device?: { mobile: number; desktop: number; tablet: number } | null;
  carts?: number;
  begin_checkout?: number;
  impressions?: number | null;
}

export interface CouponRow {
  // OBS: o backend NÃO retorna id_coupon (está comentado no transform).
  // A rota /db/query/coupon recalcula o uso a partir do dump pedidos_<loja> (paridade com
  // o legado), retornando UMA linha por cupom já agregada no período; por isso date_coupon
  // pode vir null.
  date_coupon: string | null;
  name: string;
  quantity: number; // nº de pedidos que usaram o cupom no período
  total_money: number; // faturamento dos pedidos que usaram o cupom
  total_discount: number; // valor do cupom (campo `value`): percentual ou R$ conforme discount_type
  discount_type?: string | null; // 'percentage' | 'absolute' — habilita o render type-aware
  order_ids: number[]; // jsonb -> array de order_id
  store: string; // nome da loja ('outlet' | 'artepropria') — retornado pela rota com :store
}

export interface ClientRow {
  id_cli: number;
  cpf_cnpj_cli: string;
  nome_cli: string;
  email_cli: string;
  fone_cli: string;
  tipo_cli: string; // 'F' (física) | 'J' (jurídica)
  bairro_cli: string;
  cidade_cli: string;
  numero_cli: string;
  uf_cli: string;
  cep_cli: string;
  endereco_cli: string;
  dt_criacao_cli: string;
  ativo: number;
  dt_att_ativo: string;
  origem_cli: string | null;
}

export interface ProductRow {
  cod_categoria: string; // SKU (PK)
  nome_categoria: string;
  desc_categoria: string;
  grp_categoria: string | null;
  ativo: number;
  dim_categoria: string | null;
  cor_categoria: string | null;
  tipo_categoria: string | null;
  dt_att_ativo: string;
  dt_att_categoria: string;
  img_categoria: string | null;
  custo_categoria: number;
  tempo_prod_categoria: string | null;
  preco: number;
}

// Tipo união para todos os dados possíveis das tabelas
export type DatabaseData =
  | OrderShop
  | ClientRow
  | CouponRow
  | DailySale
  | AdsRow
  | ProductRow;

// Enum para as tabelas disponíveis (valor = nome real da tabela no SQL)
export enum DatabaseTable {
  ADS = 'ads',
  CLIENTS = 'clients',
  COUPON = 'coupon',
  DAILY_SALES = 'daily_sales',
  ORDERS_SHOP = 'orders_shop',
  PRODUCT = 'product',
}

// Opções de filtro para a busca genérica em /db/query
// Rota real: GET /db/query/:querySelect/:store/:startDate/:endDate
// (store, startDate e endDate são todos OBRIGATÓRIOS no path).
export interface FetchTableOptions {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  store?: string | number; // nome ('outlet'/'artepropria') ou ID numérico
}

// Estado do contexto
export interface DatabaseContextState {
  data: DatabaseData[];
  loading: boolean;
  error: string | null;
  currentTable: DatabaseTable | null;
}

// Ações disponíveis
export type DatabaseAction =
  | { type: 'FETCH_START'; table: DatabaseTable }
  | { type: 'FETCH_SUCCESS'; table: DatabaseTable; data: DatabaseData[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'CLEAR_DATA' };

// Props do provedor
export interface DatabaseProviderProps {
  children: ReactNode;
}

// Tipo do contexto
export interface DatabaseContextType {
  state: DatabaseContextState;
  fetchData: (table: DatabaseTable, options?: FetchTableOptions) => Promise<void>;
  clearData: () => void;
  getCurrentData: <T extends DatabaseData>() => T[];
  // Sinal de recarga manual (ButtonReload): quem busca da base nova adiciona
  // reloadKey às deps do efeito p/ refetchar; reloadData() incrementa o sinal.
  reloadKey: number;
  reloadData: () => void;
}