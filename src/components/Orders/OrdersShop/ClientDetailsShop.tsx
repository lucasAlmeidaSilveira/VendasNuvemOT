import React from 'react';
import { Badge, Flex, Table } from '@radix-ui/themes';
import { RadixTheme } from '../../RadixTheme';
import { FaWhatsapp } from 'react-icons/fa';
import { Oval } from 'react-loader-spinner';
import { ContainerDetails, RowTitle } from '../styles';
import { Tag } from '../../Tag';
import {
  formatCurrency,
  formatDateToUTC,
  formatPhoneNumber,
} from '../../../tools/tools';
import { useClient } from '../../../hooks/clientCache';
import { OrderShop } from '../../../types';

interface ClientDetailsShopProps {
  order: OrderShop;
}

// Link de WhatsApp a partir do telefone do cliente (apenas dígitos).
function whatsappLink(phone: string, name?: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  const firstName = (name || '').split(' ')[0];
  return `https://api.whatsapp.com/send/?phone=${digits}&text=Oi+${firstName}`;
}

function formatShippingCost(cost: number): string {
  const value = Number(cost);
  if (!Number.isFinite(value) || value === 0) return 'Frete Grátis';
  return formatCurrency(value);
}

export function ClientDetailsShop({ order }: ClientDetailsShopProps) {
  const { client, loading } = useClient(order.id_cli);

  const coupons = Array.isArray(order.coupons) ? order.coupons : [];
  const markers = Array.isArray(order.markers_order_tiny)
    ? order.markers_order_tiny
    : [];
  const hasTracking =
    order.url_tracking &&
    order.url_tracking !== 'None' &&
    order.url_tracking !== '';
  const hasOrderTrackingLink =
    order.order_tracking_link &&
    order.order_tracking_link !== 'None' &&
    order.order_tracking_link !== '';

  return (
    <RadixTheme hasBackground={false} style={{ minHeight: '10%' }}>
      <ContainerDetails>
        <RowTitle>
          <h3>
            {loading ? (
              <Oval
                height={16}
                width={16}
                color='#1874cd'
                visible={true}
                ariaLabel='oval-loading'
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
            ) : (
              client?.nome_cli || `Cliente #${order.id_cli}`
            )}
          </h3>
          {markers.map((marker, index) => (
            <Tag key={`${marker}-${index}`}>
              <span>{marker}</span>
            </Tag>
          ))}
        </RowTitle>

        <Table.Root variant='surface' layout={'auto'}>
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
              <Table.Cell p={'4'}>{client?.cpf_cnpj_cli || '—'}</Table.Cell>
              <Table.Cell p={'4'}>{client?.email_cli || '—'}</Table.Cell>
              <Table.Cell p={'4'}>
                {client?.fone_cli ? (
                  <a
                    className='link-whatsapp'
                    href={whatsappLink(client.fone_cli, client.nome_cli)}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {formatPhoneNumber(client.fone_cli)}
                    <FaWhatsapp size={20} color='var(--uipositive-100)' />
                  </a>
                ) : (
                  'Não informado'
                )}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {client ? (
                  <>
                    {client.cidade_cli}
                    {client.uf_cli ? `, ${client.uf_cli}` : ''}
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {client.endereco_cli}
                      {client.numero_cli ? `, ${client.numero_cli}` : ''}
                    </p>
                  </>
                ) : (
                  '—'
                )}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {order.fiscal_note &&
                order.fiscal_note !== 'None' &&
                order.fiscal_note !== '' ? (
                  <a
                    href={order.fiscal_note}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
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
              <Table.ColumnHeaderCell>
                Previsão de entrega
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Rastreio</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Cupom de desconto</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Frete</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Página do pedido</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell p={'4'}>
                {formatDateToUTC(order.created_at)}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {order.estimated_delivery
                  ? formatDateToUTC(order.estimated_delivery, 'dateSimple')
                  : '—'}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {hasTracking ? (
                  <a
                    href={order.url_tracking as string}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Rastrear envio
                  </a>
                ) : order.gateway_link ? (
                  <a
                    href={order.gateway_link}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Página do pedido
                  </a>
                ) : (
                  '—'
                )}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {coupons.length ? (
                  <Flex gap={'1'} wrap={'wrap'} align={'center'}>
                    {coupons.map((code, index) => (
                      <Badge
                        key={`${code}-${index}`}
                        color={'purple'}
                        radius={'full'}
                      >
                        {code}
                      </Badge>
                    ))}
                    {order.coupon_discount > 0 && (
                      <span style={{ fontSize: 12 }}>
                        (-{formatCurrency(order.coupon_discount)})
                      </span>
                    )}
                  </Flex>
                ) : (
                  'Não'
                )}
              </Table.Cell>
              <Table.Cell p={'4'}>
                {formatShippingCost(order.shipping_cost)}
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {order.shipping_option}
                </p>
              </Table.Cell>
              <Table.Cell p={'4'}>
                {hasOrderTrackingLink ? (
                  <a
                    href={order.order_tracking_link as string}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Link de acompanhamento
                  </a>
                ) : (
                  '—'
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </ContainerDetails>
    </RadixTheme>
  );
}
