import { ReactNode } from "react";

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
  google: number,
  googleEcom: number,
  googleQuadros: number,
  googleEspelhos: number,
  googleGeral: number,
  meta: number,
  metaEcom: number,
  metaQuadros: number,
  metaEspelhos: number,
  metaGeral: number,
}

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
  isLoadingADSMeta: boolean
}

export interface DataSectionAnalyticsProps {
  bgcolor: string;
  totalAdSpend: number;
}

export interface Coupon {
  code: string;
  used: number;
  value: string;
}

export interface Order {
  id: string;
  shipping_status: string;
  shipping_min_days: number;
  shipping_max_days: number;
  payment_details: {
    method: string;
  }
  payment_status: string;
  created_at: string;
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
  totalCost: TotalCost;
  impressions: number;
}

export type TotalCost = {
  all: number;
  ecom: number;
  quadros: number;
  espelhos: number;
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
  totalCost: TotalCost;
  carts: number;
  beginCheckout: number;
}

export interface DataAnalyticsProps {
  data: DataProps;
  dataADSMeta: ADSMetaEntry[];
  isLoadingADSGoogle: boolean;
  isLoadingADSMeta: boolean;
  error: string | null;
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
}

export interface BudgetItemProps {
  icon?: React.ElementType;
  iconColor?: string;
  bullet?: string;
  small?: string | number;
  title: string;
  value: number | string;
  isLoading: boolean;
  tooltip?: string;
}

export interface DataCosts {
  name: string;
  value: number | string;
}