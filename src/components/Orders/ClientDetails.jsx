import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { ContainerDetails, RowTitle } from './styles';
import {
  formatCurrency,
  formatDateToUTC,
  formatPhoneNumber,
} from '../../tools/tools.ts';
import { FaWhatsapp } from 'react-icons/fa';
import { TooltipInfo } from '../TooltipInfo';
import { AiFillMessage } from 'react-icons/ai';
import { getLinkNoteTiny, getOrderTiny } from '../../api';
import { Oval } from 'react-loader-spinner';
import { Tag } from '../Tag';
import { IoReload } from 'react-icons/io5';
import { Table, Theme } from '@radix-ui/themes';

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
        const isNote =
          fetchedOrder.situacao !== 'Em aberto' &&
          fetchedOrder.situacao !== 'Aprovado' &&
          fetchedOrder.situacao !== 'Preparando envio' &&
          fetchedOrder.situacao !== 'Cancelado';

        if (isNote) {
          const linkNote = await getLinkNoteTiny(numberOrder, cpf);
          setNoteLink(linkNote);
        }
        if (fetchedOrder && fetchedOrder.marcadores) {
          setMarkOrderTiny(
            fetchedOrder.marcadores.map((item) => item.marcador),
          );
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
  }

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
    <Theme hasBackground={false} style={{ minHeight: '10%' }}>
      <ContainerDetails>
        <RowTitle>
          <h3>{order.contact_name}</h3>

          {isLoadingNote ? (
            <Oval
              height={16}
              width={16}
              color="#1874cd"
              visible={true}
              ariaLabel="oval-loading"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          ) : (
            markOrderTiny.length >= 1 &&
            markOrderTiny.map((marcador) => (
              <Tag key={marcador.id}>
                {formatDescription(marcador.descricao)}
              </Tag>
            ))
          )}

          {order.note && (
            <TooltipInfo title={order.note}>
              <AiFillMessage color={'var(--geralblack-80'} />
            </TooltipInfo>
          )}

          <TooltipInfo title={'Atualizar informações do Tiny'}>
            <IoReload className="btn-reload" onClick={handleInfoOrderTiny} />
          </TooltipInfo>
        </RowTitle>

        <Table.Root variant="surface" layout={'auto'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>CPF/CNPJ</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Telefone</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Localização</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Nota Fiscal</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell p={'4'}>{order.contact_identification}</Table.Cell>
              <Table.Cell p={'4'}>{order.contact_email}</Table.Cell>
              <Table.Cell p={'4'}>
                {order.contact_phone ? (
                  <>
                    <a
                      className="link-whatsapp"
                      href={linkWhats(order.contact_name, order.contact_phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatPhoneNumber(order.contact_phone)}
                      <FaWhatsapp size={20} color="var(--uipositive-100)" />
                    </a>
                  </>
                ) : (
                  'Não informado'
                )}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {order.shipping_address.city}, {order.shipping_address.province}
                <p style={{ fontSize: '12px', color: 'var(--geralblack-70)' }}>
                  {order.shipping_address.address},{' '}
                  {order.shipping_address.number}
                </p>
              </Table.Cell>
              <Table.Cell p={'4'}>
                {isLoadingNote ? (
                  <Oval
                    height={16}
                    width={16}
                    color="#1874cd"
                    visible={true}
                    ariaLabel="oval-loading"
                    strokeWidth={4}
                    strokeWidthSecondary={4}
                  />
                ) : noteLink ? (
                  <a href={noteLink} target="_blank" rel="noopener noreferrer">
                    Clique para visualizar
                  </a>
                ) : (
                  'Não disponível'
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Data da compra</Table.ColumnHeaderCell>
              {/* <Table.ColumnHeaderCell>Última atualização</Table.ColumnHeaderCell> */}
              <Table.ColumnHeaderCell>
                Previsão de entrega
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Página do pedido</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Cupom de desconto</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Frete</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell p={'4'}>
                {formatDateToUTC(order.created_at)}
              </Table.Cell>
              {/* <Table.Cell p={'4'}>{formatDateToUTC(order.updated_at)}</Table.Cell> */}
              <Table.Cell p={'4'}>
                {calculateEstimatedDeliveryDate(
                  order.created_at,
                  order.shipping_max_days,
                )}
              </Table.Cell>
              <Table.Cell p={'4'}>
                <a
                  href={createUrlPageBuy(order.id, order.token)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link de acompanhamento
                </a>
              </Table.Cell>
              <Table.Cell p={'4'}>{formatCoupon(order.coupon)}</Table.Cell>
              <Table.Cell p={'4'}>
                {shippingCost(order.shipping_cost_customer)}
                <p style={{ fontSize: '12px', color: 'var(--geralblack-70)' }}>
                  {order.shipping_option}
                </p>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </ContainerDetails>
    </Theme>
  );
}
