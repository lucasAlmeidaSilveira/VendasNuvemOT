import React, { useEffect, useState } from 'react';
import { getOrderTiny } from '../../api';
import { FaTruckArrowRight } from "react-icons/fa6";
import { TbClockStop, TbNotes, TbPackageExport, TbReload, TbXboxX } from "react-icons/tb";
import { FaCheckCircle, FaStore } from "react-icons/fa";
import { MdAssignmentLate } from "react-icons/md";
import { ShippingStatusContainer } from './styles';

function calculateShippingStatus(statusOrder, status, created_at, shippingMinDays, shippingMaxDays, paymentStatus) {
  const backgroundColorMap = {
    'Preparando envio': '#d8e9f3', // Azul claro
    'Em aberto': '#fef6d7', // Amarelo
    'Aprovado': '#d4f8d1', // Verde claro
    'Faturado (atendido)': '#d8e9f3', // Azul claro
    'Pronto para envio': '#ffe3c0', // Laranja claro
    'Enviado': '#d8e9f3', // Azul claro
    'Entregue': '#d4f8d1', // Verde claro
    'Não Entregue': '#e0e0e0', // Cinza claro
    'Cancelado': '#fbd4d4', // Vermelho claro
    late: '#fbd4d4', // Vermelho claro para atrasados
  };
  
  const borderColorMap = {
    'Preparando envio': '#3498db', // Azul escuro
    'Em aberto': '#f1c40f', // Amarelo escuro
    'Aprovado': '#2ecc71', // Verde escuro
    'Faturado (atendido)': '#3498db', // Azul escuro
    'Pronto para envio': '#e67e22', // Laranja escuro
    'Enviado': '#3498db', // Azul escuro
    'Entregue': '#2ecc71', // Verde escuro
    'Não Entregue': '#95a5a6', // Cinza escuro
    'Cancelado': '#e74c3c', // Vermelho escuro
    late: '#e74c3c', // Vermelho escuro para atrasados
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
    status: isLate ? 'Atrasado' : status,
    backgroundColor: isLate ? backgroundColorMap.late : backgroundColorMap[currentStatus],
    borderColor: isLate ? borderColorMap.late : borderColorMap[currentStatus],
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
      return <TbNotes />
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

const formatUrlTracking = (code) => {
  if (code) {
    return `https://rastreae.com.br/resultado/${code}`;
  }

  return code;
};

export function ShippingStatus({ statusOrder, order, created_at, shippingMinDays, shippingMaxDays, shipping }) {
  const [ status, setStatus ] =  useState('Atualizando status...')
  const [ urlTracking, setUrlTracking ] = useState('')

  useEffect(() => {
    const fetchDataOrderTiny = async (orderId, orderIdentification) => {
      const order = await getOrderTiny(orderId, orderIdentification)
      if(order) {
        setStatus(order.situacao)
        setUrlTracking(() => formatUrlTracking(order.codigo_rastreamento))
        return order
      }
    }

    if(order.storefront !== 'Loja') {
      fetchDataOrderTiny(order.order_id, order.customer.identification)
    }
  }, [])

  const { status: currentStatus, backgroundColor, borderColor } = calculateShippingStatus(
    statusOrder,
    status,
    created_at,
    shippingMinDays,
    shippingMaxDays,
  );

  return (
    <a href={urlTracking || undefined} target={urlTracking ? '_blank' : undefined}>
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