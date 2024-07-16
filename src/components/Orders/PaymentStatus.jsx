import React from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { FaCreditCard, FaHandshakeSimple, FaPix } from 'react-icons/fa6';
import { PaymentStatusContainer } from './styles';
import { TooltipInfo } from '../TooltipInfo';

export function PaymentStatus({ status, payment }) {
  const statusMap = {
    paid: 'Pagamento recebido',
    pending: 'Aguardando pagamento',
    voided: 'Pagamento recusado',
    refunded: 'Estornado'
  };
  
  const paymentType = {
    credit_card: 'Cartão',
    pix: 'Pix',
    boleto: 'Boleto',
    other: 'Parceria',
  };
  
  const backgroundColorMap = {
    paid: '#e0ffe0', // Cor de fundo para status pago
    pending: '#fffbe0', // Cor de fundo para status pendente
    voided: '#ffe0e0', // Cor de fundo para status recusado
    refunded: '#d3d3d3'
  };

  const borderColorMap = {
    paid: '#a0ffa0', // Cor da borda para status pago
    pending: '#ffffa0', // Cor da borda para status pendente
    voided: '#ffa0a0', // Cor da borda para status recusado
  };

  const getIcon = payment => {
    switch (payment) {
      case 'credit_card':
        return <FaCreditCard />;
      case 'pix':
        return <FaPix />;
      case 'boleto':
        return <FaFileInvoiceDollar />;
      case 'other':
        return <FaHandshakeSimple />;
      default:
        return <FaCreditCard />;
    }
  };

  return (
    <TooltipInfo title={paymentType[payment]}>
      <PaymentStatusContainer
        backgroundColor={backgroundColorMap[status] || '#f0f0f0'}
        borderColor={borderColorMap[status] || 'rgba(0,0,0,0.1)'}
      >
        {getIcon(payment)}
        <span>{statusMap[status] || status}</span>
      </PaymentStatusContainer>
    </TooltipInfo>
  );
}
