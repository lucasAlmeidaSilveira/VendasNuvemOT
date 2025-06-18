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
    NOK: 'yellow', // Amarelo
    OK: 'green', // Verde claro
    'Atualizando status...': 'gray',
  };

  let currentStatus = statusOrder;

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

const getIcon = (currentStatus) => {
  switch (currentStatus) {
    case 'Atualizando status...':
      return <TbReload />;
    case 'OK':
      return <FaCheckCircle />;
    case 'NOK':
      return <MdAssignmentLate />;
    case 'Cancelado':
      return <TbXboxX />;
    default:
      return null;
  }
};

export function DeliveryStatus({ statusOrder, shipping }) {
  const [status, setStatus] = useState('Atualizando status...');

  useEffect(() => {
    setStatus(statusOrder);
  }, []);

  const { status: currentStatus, backgroundColor } = calculateShippingStatus(
    statusOrder,
    status,
  );

  return (
    <Badge variant="solid" radius="full" size={'2'} color={backgroundColor}>
      {getIcon(currentStatus)}
      <span>{shipping}</span>
    </Badge>
  );
}
