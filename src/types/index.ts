export interface DataSectionTPagoProps {
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

