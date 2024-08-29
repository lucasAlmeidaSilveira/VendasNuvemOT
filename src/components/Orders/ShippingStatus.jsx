import React from 'react';
import { FaTruckArrowRight } from "react-icons/fa6";
import { TbPackageExport } from "react-icons/tb";
import { FaCheckCircle, FaStore } from "react-icons/fa";
import { MdAssignmentLate } from "react-icons/md";
import { ShippingStatusContainer } from './styles';

function calculateShippingStatus(statusOrder, status, created_at, shippingMinDays, shippingMaxDays, paymentStatus) {
  const statusMap = {
    unpacked: 'A Enviar',
    shipped: 'Enviado',
    closed: 'Entregue',
    late: 'Atrasado'
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

  // Se o pedido está fechado, o status é 'Entregue'
  if (statusOrder === 'closed') {
    currentStatus = 'closed';
  } 

  // Verifica se o pagamento foi realizado e se o pedido está atrasado
  const shippingDeadline = new Date(created_at);
  shippingDeadline.setDate(shippingDeadline.getDate() + (shippingMaxDays || shippingMinDays));
  const isLate = new Date() > shippingDeadline && currentStatus !== 'closed' && paymentStatus === 'paid';

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
    default:
      return null;
  }
};

export function ShippingStatus({ statusOrder, status, created_at, shippingMinDays, shippingMaxDays, urlTracking, paymentStatus, shipping }) {
  const { status: currentStatus, backgroundColor, borderColor } = calculateShippingStatus(
    statusOrder,
    status,
    created_at,
    shippingMinDays,
    shippingMaxDays,
    paymentStatus // Passa o status de pagamento
  );

  return (
    <a href={urlTracking} target='_blank'>
      {shipping === 'Entrega Loja' ? (
        <ShippingStatusContainer backgroundColor={backgroundColor} borderColor={borderColor}>
          <FaStore />
          <span>Entrega Loja</span>
        </ShippingStatusContainer>
      ) : (
        <ShippingStatusContainer backgroundColor={backgroundColor} borderColor={borderColor}>
          {getIcon(currentStatus)}
          <span>{currentStatus}</span>
        </ShippingStatusContainer>
      )}
    </a>
  );
}
