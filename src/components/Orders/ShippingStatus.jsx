import React from 'react';
import { FaTruckArrowRight } from "react-icons/fa6";
import { TbPackageExport } from "react-icons/tb";
import { FaCheckCircle } from "react-icons/fa";
import { MdAssignmentLate } from "react-icons/md";
import { ShippingStatusContainer } from './styles';

function calculateShippingStatus(statusOrder, status, created_at, shippingMinDays, shippingMaxDays) {
  const statusMap = {
    unpacked: 'A Enviar',
    shipped: 'Enviado',
    closed: 'Entregue',
  };

  const backgroundColorMap = {
    unpacked: '#fffbe0', // Amarelo claro
    shipped: '#daf1fa',
    closed: '#e0ffe0',
    late: '#ffe0e0',
  };

  const borderColorMap = {
    unpacked: '#f49820', // Amarelo
    shipped: '#39abe4',
    closed: '#38b257',
    late: '#e64e4e',
  };

  let currentStatus = status;
  if (statusOrder === 'closed') {
    currentStatus = 'closed';
  } else if (statusOrder === 'paid' && status === 'closed') {
    currentStatus = 'closed';
  }

  const shippingDeadline = new Date(created_at);
  shippingDeadline.setDate(shippingDeadline.getDate() + (shippingMaxDays || shippingMinDays));

  const isLate = new Date() > shippingDeadline && currentStatus !== 'closed';

  return {
    status: isLate ? 'Atrasado' : statusMap[currentStatus],
    backgroundColor: isLate ? backgroundColorMap.late : backgroundColorMap[currentStatus],
    borderColor: isLate ? borderColorMap.late : borderColorMap[currentStatus],
  };
}

const getIcon = currentStatus => {
  switch (currentStatus) {
    case 'A Enviar':
      return <TbPackageExport />;
    case 'Enviado':
      return <FaTruckArrowRight />;
    case 'Entregue':
      return <FaCheckCircle />;
    case 'Atrasado':
      return <MdAssignmentLate />;
  }
};

export function ShippingStatus({ statusOrder, status, created_at, shippingMinDays, shippingMaxDays, urlTracking }) {
  const { status: currentStatus, backgroundColor, borderColor } = calculateShippingStatus(
    statusOrder,
    status,
    created_at,
    shippingMinDays,
    shippingMaxDays
  );

  return (
    <a href={urlTracking} target='_blank'>
      <ShippingStatusContainer backgroundColor={backgroundColor} borderColor={borderColor}>
        {getIcon(currentStatus)}
        <span>{currentStatus}</span>
      </ShippingStatusContainer>
    </a>
  );
}
