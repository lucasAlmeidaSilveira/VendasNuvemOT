import React, { useState } from 'react';
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
import { ContainerDetails, RowTitle } from './styles';
import { formatCurrency, formatDateToUTC, formatPhoneNumber } from '../../tools/tools.ts';
import { FaWhatsapp } from "react-icons/fa";
import { TooltipInfo } from '../TooltipInfo';
import { AiFillMessage } from 'react-icons/ai';
import { getLinkNoteTiny, getOrderTiny } from '../../api';
import { Oval } from 'react-loader-spinner';
import { Tag } from '../Tag';
import { IoReload } from 'react-icons/io5';

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
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [noteLink, setNoteLink] = useState('');
  const [markOrderTiny, setMarkOrderTiny] = useState([]);

  function createUrlPageBuy(id, token) {
    const urlPageBuyCheckout = `https://www.outletdosquadros.com.br/checkout/v3/success/${id}/${token}`;
    return urlPageBuyCheckout;
  }

  function linkWhats(name, numberContact) {
    const firstName = name.split(' ')[0];
    const numberContactFormat = numberContact.split('+')[1];
    const urlApiWhats = `https://api.whatsapp.com/send/?phone=${numberContactFormat}&text=Oi+${firstName}`;
    return urlApiWhats;
  }

  function shippingCost(cost) {
    const isEcom = order.storefront !== 'Loja';
    if (isEcom) {
      if (cost === '0.00') {
        return 'Frete Grátis';
      } else {
        return formatCurrency(cost);
      }
    }
  }

  async function infoOrderTiny(numberOrder, cpf) {
    setIsLoadingNote(true);
    try {
      const isEcom = order.storefront !== 'Loja';

      if (isEcom) {
        const fetchedOrder = await getOrderTiny(numberOrder, cpf);
        const isNote = fetchedOrder.situacao !== 'Em aberto' &&
          fetchedOrder.situacao !== 'Aprovado' &&
          fetchedOrder.situacao !== 'Preparando envio' &&
          fetchedOrder.situacao !== 'Cancelado';

        if (isNote) {
          const linkNote = await getLinkNoteTiny(numberOrder, cpf);
          setNoteLink(linkNote);
        }
        if (fetchedOrder && fetchedOrder.marcadores) {
          setMarkOrderTiny(fetchedOrder.marcadores.map((item) => item.marcador));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar a nota fiscal:', error);
      setNoteLink('');
    } finally {
      setIsLoadingNote(false);
    }
  }

  function formatDescription(descricao) {
    if (descricao.includes('LOTE')) {
      const [, lote] = descricao.split('LOTE');
      return `OP: ${lote.trim()}`;
    }
    return descricao;
  }

  function formatCoupon(coupon) {
    const typeCouponMap = {
      percentage: '%',
      absolute: 'R$',
    };

    const isCoupon = coupon.length >= 1;

    if (isCoupon) {
      const typeCoupon = coupon[0].type;
      const valueCoupon = coupon[0].value.split('.')[0];
      const codeCoupon = coupon[0].code;
      if (typeCoupon === 'percentage') {
        const couponFormatted = `${coupon[0].code} (${valueCoupon}${typeCouponMap[typeCoupon]})`;
        return couponFormatted;
      } else {
        const couponFormatted = `${codeCoupon}, ${typeCouponMap[typeCoupon]} ${valueCoupon}`;
        return couponFormatted;
      }
    }

    return 'Não';
  }

  async function handleInfoOrderTiny() {
    await infoOrderTiny(order.number, order.contact_identification);
  };

  // Chamar infoOrderTiny quando o componente for montado
  React.useEffect(() => {
    infoOrderTiny(order.number, order.contact_identification);
  }, [order.number, order.contact_identification]);

  // Função para calcular a data de entrega prevista com base nos dias úteis
  function calculateEstimatedDeliveryDate(startDate, days) {
    const addBusinessDays = (date, days) => {
      let resultDate = new Date(date);
      let addedDays = 0;
      while (addedDays < days) {
        resultDate.setDate(resultDate.getDate() + 1);
        if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6) {
          addedDays++;
        }
      }
      return resultDate;
    };
    
    const deliveryDate = addBusinessDays(startDate, days);

    return `${formatDateToUTC(deliveryDate, 'dateSimple')}`;
  }

  return (
    <ContainerDetails>
      <RowTitle>
        <h3>{order.contact_name}</h3>

        {isLoadingNote ? (
          <Oval
            height={16}
            width={16}
            color="#1874cd"
            visible={true}
            ariaLabel='oval-loading'
            strokeWidth={4}
            strokeWidthSecondary={4}
          />
        ) : (
          markOrderTiny.length >= 1 && (
            markOrderTiny.map((marcador) => (
              <Tag key={marcador.id}>{formatDescription(marcador.descricao)}</Tag>
            ))
          )
        )}

        {order.note && (
          <TooltipInfo title={order.note}>
            <AiFillMessage color={'var(--geralblack-80'} />
          </TooltipInfo>
        )}

        <TooltipInfo title={'Atualizar informações do Tiny'}>
          <IoReload className='btn-reload' onClick={handleInfoOrderTiny} />
        </TooltipInfo>
      </RowTitle>

      <TableContainer component={Paper}>
        <Table aria-label='products table'>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>CPF/CNPJ</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Telefone</StyledTableHeadCell>
              <StyledTableHeadCell>Localização</StyledTableHeadCell>
              <StyledTableHeadCell>Nota Fiscal</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <StyledTableCell>{order.contact_identification}</StyledTableCell>
              <StyledTableCell>{order.contact_email}</StyledTableCell>
              <StyledTableCell style={{ display: 'flex', gap: '4px', alignItems: 'center', borderBottom: 'none' }}>
                {order.contact_phone ? (
                  <>
                    {formatPhoneNumber(order.contact_phone)}
                    <a href={linkWhats(order.contact_name, order.contact_phone)} target='_blank' rel='noopener noreferrer'>
                      <FaWhatsapp size={20} color='var(--uipositive-100)' />
                    </a>
                  </>
                ) : (
                  'Não informado'
                )}
              </StyledTableCell>
              <StyledTableCell>
                {order.shipping_address.city}, {order.shipping_address.province}
                <p style={{ fontSize: '12px', color: 'var(--geralblack-70)' }}>
                  {order.shipping_address.address}, {order.shipping_address.number}
                </p>
              </StyledTableCell>
              <StyledTableCell>
                {isLoadingNote ? (
                  <Oval
                    height={16}
                    width={16}
                    color="#1874cd"
                    visible={true}
                    ariaLabel='oval-loading'
                    strokeWidth={4}
                    strokeWidthSecondary={4}
                  />
                ) : (
                  noteLink ? (
                    <a href={noteLink} target="_blank" rel="noopener noreferrer">Clique para visualizar</a>
                  ) : (
                    'Não disponível'
                  )
                )}
              </StyledTableCell>
            </TableRow>
          </TableBody>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Data da compra</StyledTableHeadCell>
              {/* <StyledTableHeadCell>Última atualização</StyledTableHeadCell> */}
              <StyledTableHeadCell>Previsão de entrega</StyledTableHeadCell>
              <StyledTableHeadCell>Página do pedido</StyledTableHeadCell>
              <StyledTableHeadCell>Cupom de desconto</StyledTableHeadCell>
              <StyledTableHeadCell>Frete</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <StyledTableCell>{formatDateToUTC(order.created_at)}</StyledTableCell>
              {/* <StyledTableCell>{formatDateToUTC(order.updated_at)}</StyledTableCell> */}
              <StyledTableCell>
                {calculateEstimatedDeliveryDate(order.created_at, order.shipping_min_days)}
              </StyledTableCell>
              <StyledTableCell>
                <a
                  href={createUrlPageBuy(order.id, order.token)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Link de acompanhamento
                </a>
              </StyledTableCell>
              <StyledTableCell>{formatCoupon(order.coupon)}</StyledTableCell>
              <StyledTableCell>
                {shippingCost(order.shipping_cost_customer)}
                <p style={{ fontSize: '12px', color: 'var(--geralblack-70)' }}>{order.shipping_option}</p>
              </StyledTableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ContainerDetails>
  );
}
