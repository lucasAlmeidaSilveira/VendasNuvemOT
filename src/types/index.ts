export interface DataSectionTPagoProps {
  title: string;
  bgcolor: string;
  verbaGoogle: number;
  verbaMeta: number;
  totalAdSpend: number;
  totalOrdersFormatted: number;
  roas: number | string;
  roasMax?: number | string;
  isLoadingADSGoogle: boolean;
  isLoadingOrders: boolean;
  isLoadingADSMeta: boolean;
}

export interface DataSectionCartProps {
  bgcolor: string;
}

export interface DataSectionTPagoProps {
  bgcolor: string;
  totalAdSpend: number;
  totalOrdersFormatted: number;
  isLoadingADSGoogle: boolean;
  isLoadingADSMeta: boolean;
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
  totalAdSpend: number;
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

