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
}

export interface DataSectionTPagoAPProps {
  title: string;
  bgcolor: string;
  verbaGoogle: number | string;
  verbaMeta: number | string;
  totalAdSpend: number | string;
  totalOrdersFormatted: number;
  roas: number | string;
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
}

export interface DataCosts {
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
