import React from 'react';
import { FaTruck } from 'react-icons/fa';
import { ShippingStatusContainer } from './styles';

function calculateShippingStatus(statusOrder, status, createdAt, shippingMinDays, shippingMaxDays) {
  const statusMap = {
    unpacked: 'A Enviar',
    shipped: 'Enviado',
    closed: 'Entregue',
  };

  const backgroundColorMap = {
    unpacked: '#fffbe0', // Amarelo claro
    shipped: '#c8edfa',
    closed: '#c9fcc9',
    late: '#ffcccc',
  };

  const borderColorMap = {
    unpacked: '#ffe580', // Amarelo
    shipped: '#b8e5fc',
    closed: '#97ff97',
    late: '#ff9999',
  };

  let currentStatus = status;
  if (statusOrder === 'closed') {
    currentStatus = 'closed';
  } else if (statusOrder === 'paid' && status === 'closed') {
    currentStatus = 'closed';
  }

  const shippingDeadline = new Date(createdAt);
  shippingDeadline.setDate(shippingDeadline.getDate() + (shippingMaxDays || shippingMinDays));

  const isLate = new Date() > shippingDeadline && currentStatus !== 'closed';

  return {
    status: isLate ? 'Atrasado' : statusMap[currentStatus],
    backgroundColor: isLate ? backgroundColorMap.late : backgroundColorMap[currentStatus],
    borderColor: isLate ? borderColorMap.late : borderColorMap[currentStatus],
  };
}

export function ShippingStatus({ statusOrder, status, createdAt, shippingMinDays, shippingMaxDays, urlTracking }) {
  const { status: currentStatus, backgroundColor, borderColor } = calculateShippingStatus(
    statusOrder,
    status,
    createdAt,
    shippingMinDays,
    shippingMaxDays
  );

  return (
    <a href={urlTracking} target='_blank'>
      <ShippingStatusContainer backgroundColor={backgroundColor} borderColor={borderColor}>
        <FaTruck />
        <span>{currentStatus}</span>
      </ShippingStatusContainer>
    </a>
  );
}
