import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ContainerDetails } from './styles';
import { formatDateToUTC, formatPhoneNumber } from '../../tools/tools';
import { FaWhatsapp } from "react-icons/fa";

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: 'var(--geralblack-10)',
  fontSize: 14,
  fontWeight: 600,
  padding: '8px 16px',
  fontFamily: 'Poppins',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'left',
  fontSize: 14,
  fontFamily: 'Poppins',
  padding: '8px 16px',
  whiteSpace: 'pre-wrap',
}));

export function ClientDetails({ order }) {
  function createUrlPageBuy(id, token) {
    const urlPageBuyCheckout = `https://www.outletdosquadros.com.br/checkout/v3/success/${id}/${token}`;

    return urlPageBuyCheckout;
  }

  function linkWhats(name, numberContact){
    const firstName = name.split(' ')[0]
    const numberContactFormat = numberContact.split('+')[1]
    const urlApiWhats = `https://api.whatsapp.com/send/?phone=${numberContactFormat}&text=Oi+${firstName}`

    return urlApiWhats
  }

  function formatLocation(city, province){
    return `${city}, ${province}`
  }

  function formatCoupon(coupon){
    const typeCouponMap = {
      percentage: '%',
      absolute: 'R$'
    }

    const isCoupon = coupon.length >= 1

    if(isCoupon){
      const typeCoupon = coupon[0].type
      const valueCoupon = coupon[0].value.split('.')[0]
      const codeCoupon = coupon[0].code
      if(typeCoupon === 'percentage'){
        const couponFormatted = `${coupon[0].code} (${valueCoupon}${typeCouponMap[typeCoupon]})`
        return couponFormatted
      } else {
        const couponFormatted = `${codeCoupon}, ${typeCouponMap[typeCoupon]} ${valueCoupon}`
        return couponFormatted
      }
    }

    return 'Não'
  }

  return (
    <ContainerDetails>
      <h3>{order.client}</h3>
      <TableContainer component={Paper}>
        <Table aria-label='products table'>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>CPF/CNPJ</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Telefone</StyledTableHeadCell>
              <StyledTableHeadCell>Localização</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <StyledTableCell>
                {order.data.contact_identification}
              </StyledTableCell>
              <StyledTableCell>{order.data.contact_email}</StyledTableCell>
              <StyledTableCell style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                {formatPhoneNumber(order.data.contact_phone)}
                <a href={linkWhats(order.client, order.data.contact_phone)} target='_blank'><FaWhatsapp size={20} color='var(--uipositive-100)'/></a>
              </StyledTableCell>
              <StyledTableCell>{formatLocation(order.data.billing_city, order.data.billing_province)}</StyledTableCell>
            </TableRow>
          </TableBody>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Data da compra</StyledTableHeadCell>
              <StyledTableHeadCell>Última atualização</StyledTableHeadCell>
              <StyledTableHeadCell>Página do pedido</StyledTableHeadCell>
              <StyledTableHeadCell>Cupom de desconto</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <StyledTableCell>{formatDateToUTC(order.createdAt)}</StyledTableCell>
              <StyledTableCell>{formatDateToUTC(order.data.updated_at)}</StyledTableCell>
              <StyledTableCell>
                <a
                  href={createUrlPageBuy(order.id, order.data.token)}
                  target='_blank'
                  rel='noopener noreferrer'
                  >
                  Link de acompanhamento
                </a>
              </StyledTableCell>
              <StyledTableCell>{formatCoupon(order.data.coupon)}</StyledTableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ContainerDetails>
  );
}