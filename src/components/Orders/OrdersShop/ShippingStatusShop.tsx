import React from 'react';
import { Badge } from '@radix-ui/themes';
import { TbClockStop, TbPackageExport, TbNotes, TbXboxX } from 'react-icons/tb';
import { FaTruckArrowRight } from 'react-icons/fa6';
import { FaCheckCircle } from 'react-icons/fa';
import { MdAssignmentLate } from 'react-icons/md';
import { OrderShop } from '../../../types';

// orders_shop.shipping_status vem MISTO: códigos en (Nuvemshop) e strings PT
// (Tiny). Mapeamos ambos para rótulo/cor/ícone.
const STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  // inglês (Nuvemshop)
  unpacked: { label: 'Em produção', color: 'orange', icon: <TbClockStop /> },
  unshipped: { label: 'Não enviado', color: 'gray', icon: <TbClockStop /> },
  packed: { label: 'Embalado', color: 'cyan', icon: <TbPackageExport /> },
  shipped: { label: 'Enviado', color: 'indigo', icon: <FaTruckArrowRight /> },
  delivered: { label: 'Entregue', color: 'green', icon: <FaCheckCircle /> },
  // português (Tiny)
  Aprovado: { label: 'Aprovado', color: 'green', icon: <TbPackageExport /> },
  Faturado: { label: 'Faturado', color: 'jade', icon: <TbNotes /> },
  'Preparando envio': {
    label: 'Preparando envio',
    color: 'cyan',
    icon: <TbPackageExport />,
  },
  'Pronto para envio': {
    label: 'Pronto p/ envio',
    color: 'amber',
    icon: <TbPackageExport />,
  },
  Enviado: { label: 'Enviado', color: 'indigo', icon: <FaTruckArrowRight /> },
  Entregue: { label: 'Entregue', color: 'green', icon: <FaCheckCircle /> },
  Cancelado: { label: 'Cancelado', color: 'red', icon: <TbXboxX /> },
};

// Status que indicam que o pedido já saiu de produção (enviado/entregue/cancelado).
const SHIPPED_OR_DONE = new Set([
  'shipped',
  'Enviado',
  'delivered',
  'Entregue',
  'Cancelado',
]);
const DELIVERED = new Set(['delivered', 'Entregue']);
const SHIPPED = new Set(['shipped', 'Enviado']);
const PRODUCTION = new Set([
  'unpacked',
  'packed',
  'Faturado',
  'Aprovado',
  'Preparando envio',
  'Pronto para envio',
]);

// Adiciona N dias ÚTEIS (pula sábado/domingo) a uma data.
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const weekday = result.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return result;
}

/**
 * Atraso = mesma regra do `isLate` legado (tools.ts), adaptada ao orders_shop:
 * pedido PAGO (método != parcerias) cujo prazo de produção (paid_at + 4 dias
 * úteis) já passou e que ainda NÃO foi enviado/entregue/cancelado.
 * NOTA: usa paid_at (SLA de produção), não estimated_delivery (prazo do carrier).
 */
export function isLate(order: OrderShop): boolean {
  if (order.payment_status !== 'paid') return false;
  if (order.payment_method === 'other') return false;
  if (!order.paid_at) return false;
  const status = order.shipping_status || '';
  if (SHIPPED_OR_DONE.has(status)) return false;
  const deadline = addBusinessDays(new Date(order.paid_at), 4);
  if (Number.isNaN(deadline.getTime())) return false;
  return new Date() > deadline;
}

// Categoria normalizada p/ filtros e cards de resumo.
export type ShippingCategory =
  | 'late'
  | 'delivered'
  | 'shipped'
  | 'production'
  | 'other';

export function shippingCategory(order: OrderShop): ShippingCategory {
  if (isLate(order)) return 'late';
  const status = order.shipping_status || '';
  if (DELIVERED.has(status)) return 'delivered';
  if (SHIPPED.has(status)) return 'shipped';
  if (PRODUCTION.has(status)) return 'production';
  return 'other';
}

/**
 * Predicado único usado por cards E filtro (mantém contagem == lista filtrada).
 * Produção/Enviados exigem pagamento (igual ao card legado); Atraso já exige.
 */
export function matchesShippingFilter(
  order: OrderShop,
  filter: string,
): boolean {
  if (filter === 'all') return true;
  if (shippingCategory(order) !== filter) return false;
  if (filter === 'production' || filter === 'shipped') {
    return order.payment_status === 'paid';
  }
  return true;
}

interface ShippingStatusShopProps {
  order: OrderShop;
}

export function ShippingStatusShop({ order }: ShippingStatusShopProps) {
  if (isLate(order)) {
    return (
      <Badge variant='solid' radius='full' size={'2'} color={'tomato'}>
        <MdAssignmentLate />
        <span>Atrasado</span>
      </Badge>
    );
  }

  const status = order.shipping_status || '';
  const mapped = STATUS_MAP[status] ?? {
    label: status || 'Sem status',
    color: 'gray',
    icon: null,
  };

  return (
    <Badge variant='solid' radius='full' size={'2'} color={mapped.color}>
      {mapped.icon}
      <span>{mapped.label}</span>
    </Badge>
  );
}
