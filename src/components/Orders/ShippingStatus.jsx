import React, { useEffect, useState } from 'react';
import { getOrderTiny } from '../../api';
import { FaTruckArrowRight } from 'react-icons/fa6';
import {
  TbClockStop,
  TbNotes,
  TbPackageExport,
  TbReload,
  TbXboxX,
} from 'react-icons/tb';
import { FaCheckCircle, FaStore } from 'react-icons/fa';
import { MdAssignmentLate } from 'react-icons/md';
import { Badge } from '@radix-ui/themes';

function calculateShippingStatus(
  statusOrder,
  status,
  created_at,
  shippingMinDays,
  shippingMaxDays,
  paymentStatus,
) {
  const backgroundColorMap = {
    'Preparando envio': 'cyan', // Azul claro
    'Em aberto': 'yellow', // Amarelo
    Aprovado: 'green', // Verde claro
    'Faturado (atendido)': 'jade', // Azul claro
    'Pronto para envio': 'orange', // Laranja claro
    Enviado: 'indigo', // Azul claro
    Entregue: 'green', // Verde claro
    'Não Entregue': 'gray', // Cinza claro
    Cancelado: 'red', // Vermelho claro
    late: 'tomato', // Vermelho claro para atrasados
    'Atualizando status...': 'gray'
  };

  let currentStatus = status;

  // Se o pedido está fechado, o status é 'Entregue'
  if (statusOrder === 'closed') {
    currentStatus = 'closed';
  }

  // Verifica se o pagamento foi realizado e se o pedido está atrasado
  const shippingDeadline = new Date(created_at);
  shippingDeadline.setDate(
    shippingDeadline.getDate() + (shippingMaxDays || shippingMinDays),
  );
  const isLate =
    new Date() > shippingDeadline &&
    currentStatus !== 'closed' &&
    paymentStatus === 'paid';

  return {
    status: isLate ? 'Atrasado' : status,
    backgroundColor: isLate
      ? backgroundColorMap.late
      : backgroundColorMap[currentStatus],
  };
}

const getIcon = currentStatus => {
  switch (currentStatus) {
    case 'Atualizando status...':
      return <TbReload />;
    case 'Preparando envio':
      return <TbPackageExport />;
    case 'Pronto para envio':
      return <TbPackageExport />;
    case 'Aprovado':
      return <TbPackageExport />;
    case 'Em aberto':
      return <TbClockStop />;
    case 'Faturado':
      return <TbNotes />;
    case 'Enviado':
      return <FaTruckArrowRight />;
    case 'Entregue':
      return <FaCheckCircle />;
    case 'Atrasado':
      return <MdAssignmentLate />;
    case 'Cancelado':
      return <TbXboxX />;
    default:
      return null;
  }
};

const formatUrlTracking = code => {
  if (code) {
    return `https://rastreae.com.br/resultado/${code}`;
  }

  return code;
};

export function ShippingStatus({
  statusOrder,
  order,
  created_at,
  shippingMinDays,
  shippingMaxDays,
  shipping,
}) {
  const [status, setStatus] = useState('Atualizando status...');
  const [urlTracking, setUrlTracking] = useState('');

  useEffect(() => {
    const fetchDataOrderTiny = async (orderId, orderIdentification) => {
      const order = await getOrderTiny(orderId, orderIdentification);
      if (order) {
        setStatus(order.situacao);
        setUrlTracking(() => formatUrlTracking(order.codigo_rastreamento));
        return order;
      }
    };

    if (order.storefront !== 'Loja') {
      fetchDataOrderTiny(order.order_id, order.customer.identification);
    }
  }, []);

  const { status: currentStatus, backgroundColor } = calculateShippingStatus(
    statusOrder,
    status,
    created_at,
    shippingMinDays,
    shippingMaxDays,
  );

  return (
    <a
      href={urlTracking || undefined}
      target={urlTracking ? '_blank' : undefined}
    >
      {shipping === 'Entrega Loja' ? (
        <Badge variant='solid' radius="full" size={'2'} color={'purple'}>
          <FaStore />
          <span>Entrega Loja</span>
        </Badge>
      ) : (
        <Badge variant='solid' radius="full" size={'2'} color={backgroundColor}>
          {getIcon(currentStatus)}
          <span>{currentStatus}</span>
        </Badge>
      )}
    </a>
  );
}
