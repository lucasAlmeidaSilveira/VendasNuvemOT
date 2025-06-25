import { ReactNode } from 'react';

export interface DataSectionTPagoProps {
  title: string;
  bgcolor: string;
  verba: Verba;
  totalOrdersFormatted: number;
  roas: number | string;
  roasMax?: number | string;
  isLoadingADSGoogle: boolean;
  isLoadingOrders: boolean;
  isLoadingADSMeta: boolean;
  roasEspelhos: number | string;
  roasQuadros: number | string;
}

export interface DataSectionTPagoAPProps {
  title: string;
  bgcolor: string;
  verba: Verba;
  totalOrdersFormatted: number;
  roas: number | string;
  roasEcom: number | string;
  roasLoja: number | string;
  roasChatbot: number | string;
  roasMax?: number | string;
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
  orders?: Order[];
  error?: boolean;
  creatives?: Creatives[];
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
  orders?: Order[];
  creatives?: Creatives[];
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
}

export interface RefundItem {
  id: number;
  order_id: number;
  category: string;
  total: string;
  created_at: string;
  deleted: boolean;
  type: 'Reembolso' | 'Reenvio';
}

export interface RefundsContextData {
  reembolsos: RefundItem[];
  reenvios: RefundItem[];
  summaryReembolsos: RefundSummary;
  summaryReenvios: RefundSummary;
  loading: boolean;
  error: string | null;
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
