import React from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { FaCreditCard, FaHandshakeSimple, FaPix } from 'react-icons/fa6';
import { TooltipInfo } from '../TooltipInfo';
import { Badge } from '@radix-ui/themes';

export function PaymentStatus({ status, payment }) {
  const statusMap = {
    paid: 'Pago',
    pending: 'Pendente',
    voided: 'Recusado',
    refunded: 'Estornado'
  };
  
  const paymentType = {
    credit_card: 'Cartão',
    pix: 'Pix',
    boleto: 'Boleto',
    other: 'Parceria',
  };
  
  const backgroundColorMap = {
    paid: 'green', // Cor de fundo para status pago
    pending: 'yellow', // Cor de fundo para status pendente
    voided: 'red', // Cor de fundo para status recusado
    refunded: 'gray'
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

        <Badge variant='solid' radius="full" size={'2'} color={backgroundColorMap[status]}>
        {getIcon(payment)}
        {statusMap[status] || status}
        </Badge>
    </TooltipInfo>
  );
}
