import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Flex, Table, Theme } from '@radix-ui/themes';
import TablePagination from '@mui/material/TablePagination';
import TableFooter from '@mui/material/TableFooter';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import { visuallyHidden } from '@mui/utils';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { useOrders } from '../../../context/OrdersContext';
import { useAuth } from '../../../context/AuthContext';
import { useDatabaseContext } from '../../../context/DbContext';
import { useClient } from '../../../hooks/clientCache';
import { DatabaseTable, OrderShop } from '../../../types';
import { formatCurrency, formatDateShort, formatDate } from '../../../tools/tools';
import { PaymentStatus } from '../PaymentStatus';
import {
  ShippingStatusShop,
  matchesShippingFilter,
} from './ShippingStatusShop';
import { ClientDetailsShop } from './ClientDetailsShop';
import { ProductDetailsShop } from './ProductDetailsShop';
import { CustomSelect } from '../../CustomSelect';
import { InputSearch } from '../../InputSearch';
import { Loading } from '../../Loading';
import { TablePaginationActions } from '../../Pagination';
import {
  ContainerOrder,
  FilterContainer,
  Selects,
  StatusFilterContainer,
} from '../styles';

type SortOrder = 'asc' | 'desc';

// Código-base legível do SKU composto (ex.: "OT|285-...-90X60-1" -> "285").
const baseCode = (sku: string) => {
  const afterPipe = String(sku).split('|')[1] || String(sku);
  return afterPipe.split('-')[0] || String(sku);
};

const headCells = [
  { id: 'order_id', label: 'Pedido' },
  { id: 'created_at', label: 'Data' },
  { id: 'client', label: 'Cliente' },
  { id: 'products', label: 'Produtos' },
  { id: 'total', label: 'Valor' },
  { id: 'payment_status', label: 'Pagamento' },
  { id: 'shipping_status', label: 'Status' },
];

const getComparable = (order: OrderShop, key: string): number => {
  switch (key) {
    case 'total':
      return Number(order.total) || 0;
    case 'order_id':
      return Number(order.order_id) || 0;
    case 'created_at':
      return new Date(order.created_at).getTime() || 0;
    default:
      return 0;
  }
};

const comparator =
  (order: SortOrder, orderBy: string) => (a: OrderShop, b: OrderShop) => {
    const av = getComparable(a, orderBy);
    const bv = getComparable(b, orderBy);
    if (bv < av) return order === 'desc' ? -1 : 1;
    if (bv > av) return order === 'desc' ? 1 : -1;
    return 0;
  };

// Célula de cliente: resolve o nome por id_cli (com cache).
function ClientNameCell({ id }: { id: number | string }) {
  const { client, loading } = useClient(id);
  if (loading && !client) return <span>…</span>;
  return <span>{client?.nome_cli || `Cliente #${id}`}</span>;
}

const MAX_BADGES = 3;

export function OrdersShop() {
  const { date, store } = useOrders();
  const { user } = useAuth();
  const { state, fetchData, reloadKey } = useDatabaseContext();
  const { data, loading, error, currentTable } = state;

  // Loading efetivo: enquanto o estado compartilhado do DbContext ainda não
  // aponta para orders_shop (null no 1º paint, ou a tabela da aba anterior) ou
  // está carregando, mostramos spinner em vez de piscar "Nenhum pedido".
  const isBusy = loading || currentTable !== DatabaseTable.ORDERS_SHOP;

  const [statusFilter, setStatusFilter] = useState('all');
  const [shippingFilter, setShippingFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<SortOrder>('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [layout, setLayout] = useState<'auto' | 'fixed'>('auto');

  // Busca os pedidos do período/loja (rota /db/query/orders_shop/:store/:start/:end).
  useEffect(() => {
    if (!user) return; // aguarda autenticação; refetch quando `user` muda
    const startDate = formatDate(date[0]);
    const endDate = formatDate(date[1]);
    fetchData(DatabaseTable.ORDERS_SHOP, { startDate, endDate, store });
    setPage(0);
  }, [date, store, user, fetchData, reloadKey]);

  // Só usa os dados quando a tabela atual é orders_shop (contexto single-table).
  const orders = useMemo<OrderShop[]>(() => {
    if (currentTable !== DatabaseTable.ORDERS_SHOP || !Array.isArray(data)) {
      return [];
    }
    return data as OrderShop[];
  }, [data, currentTable]);

  // Resumo (cards clicáveis) por categoria de envio. Usa o MESMO predicado do
  // filtro p/ que a contagem do card bata com a lista filtrada (produção/
  // enviados exigem pago; atraso = paid_at + 4 dias úteis sem envio).
  const summary = useMemo(() => {
    let production = 0;
    let shipped = 0;
    let late = 0;
    for (const o of orders) {
      if (matchesShippingFilter(o, 'late')) late++;
      else if (matchesShippingFilter(o, 'shipped')) shipped++;
      else if (matchesShippingFilter(o, 'production')) production++;
    }
    return { production, shipped, late };
  }, [orders]);

  // Layout responsivo da tabela.
  useEffect(() => {
    const updateLayout = () =>
      setLayout(window.innerWidth >= 768 ? 'fixed' : 'auto');
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchQuery.toLowerCase();
    const result = orders.filter((o) => {
      const paymentMatch =
        statusFilter === 'all' || o.payment_status === statusFilter;
      const methodMatch =
        paymentMethodFilter === 'all' || o.payment_method === paymentMethodFilter;
      const shippingMatch = matchesShippingFilter(o, shippingFilter);

      const coupons = Array.isArray(o.coupons) ? o.coupons : [];
      const products = Array.isArray(o.products) ? o.products : [];
      const searchMatch =
        !search ||
        String(o.order_id).includes(search) ||
        String(o.id_cli).includes(search) ||
        coupons.some((c) => String(c).toLowerCase().includes(search)) ||
        products.some((p) => String(p).toLowerCase().includes(search));

      return paymentMatch && methodMatch && shippingMatch && searchMatch;
    });

    return result.sort(comparator(order, orderBy));
  }, [
    orders,
    statusFilter,
    shippingFilter,
    paymentMethodFilter,
    searchQuery,
    order,
    orderBy,
  ]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleExpand = (orderId: string) =>
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));

  const handleStatusCardClick = (category: string) => {
    setShippingFilter(category);
    setStatusFilter('all');
    setPage(0);
  };

  const sortable = new Set(['order_id', 'created_at', 'total']);

  return (
    <Theme>
      <StatusFilterContainer>
        <div
          className={`status-filter ${
            shippingFilter === 'production' ? 'active' : ''
          }`}
          onClick={() => handleStatusCardClick('production')}
        >
          <span>Em produção</span>
          <span>{isBusy ? <Loading /> : summary.production}</span>
        </div>
        <div
          className={`status-filter ${
            shippingFilter === 'shipped' ? 'active' : ''
          }`}
          onClick={() => handleStatusCardClick('shipped')}
        >
          <span>Enviados</span>
          <span>{isBusy ? <Loading /> : summary.shipped}</span>
        </div>
        <div
          className={`status-filter ${
            shippingFilter === 'late' ? 'active' : ''
          }`}
          onClick={() => handleStatusCardClick('late')}
        >
          <span>Em atraso</span>
          <span>{isBusy ? <Loading /> : summary.late}</span>
        </div>
      </StatusFilterContainer>

      <FilterContainer>
        <InputSearch
          label='Buscar pedido:'
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          placeholder='Busque por nº pedido, id do cliente, cupom ou SKU'
          totalList={filteredOrders.length}
        />
        <Selects>
          <CustomSelect
            label='Status de Envio:'
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'production', label: 'Em produção' },
              { value: 'shipped', label: 'Enviados' },
              { value: 'delivered', label: 'Entregues' },
              { value: 'late', label: 'Atrasados' },
            ]}
            value={shippingFilter}
            onChange={(e) =>
              setShippingFilter(
                (e as React.ChangeEvent<HTMLSelectElement>).target.value,
              )
            }
          />
          <CustomSelect
            label='Status de Pagamento:'
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'paid', label: 'Pagos' },
              { value: 'pending', label: 'Pendentes' },
              { value: 'voided', label: 'Recusados' },
              { value: 'refunded', label: 'Estornados' },
              { value: 'partially_refunded', label: 'Estorno parcial' },
            ]}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                (e as React.ChangeEvent<HTMLSelectElement>).target.value,
              )
            }
          />
          <CustomSelect
            label='Meios de Pagamento:'
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'credit_card', label: 'Cartão' },
              { value: 'pix', label: 'Pix' },
              { value: 'boleto', label: 'Boleto' },
              { value: 'other', label: 'Parcerias' },
            ]}
            value={paymentMethodFilter}
            onChange={(e) =>
              setPaymentMethodFilter(
                (e as React.ChangeEvent<HTMLSelectElement>).target.value,
              )
            }
          />
        </Selects>
      </FilterContainer>

      <ContainerOrder>
        <Table.Root variant='surface' layout={layout}>
          <Table.Header style={{ backgroundColor: 'lightgray' }}>
            <Table.Row>
              {headCells.map((headCell) => (
                <Table.ColumnHeaderCell key={headCell.id}>
                  {sortable.has(headCell.id) ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component='span' sx={visuallyHidden}>
                          {order === 'desc'
                            ? 'sorted descending'
                            : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isBusy ? (
              <Table.Row>
                <Table.Cell justify={'center'} colSpan={7}>
                  <Loading />
                </Table.Cell>
              </Table.Row>
            ) : error ? (
              <Table.Row>
                <Table.Cell justify={'center'} colSpan={7}>
                  Não foi possível carregar os pedidos.
                </Table.Cell>
              </Table.Row>
            ) : filteredOrders.length === 0 ? (
              <Table.Row>
                <Table.Cell justify={'center'} colSpan={7}>
                  Nenhum pedido encontrado
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((o) => {
                  const products = Array.isArray(o.products) ? o.products : [];
                  const isExpanded = !!expanded[o.order_id];
                  return (
                    <React.Fragment key={o.order_id}>
                      <Table.Row>
                        <Table.Cell>#{o.order_id}</Table.Cell>
                        <Table.Cell>{formatDateShort(o.created_at)}</Table.Cell>
                        <Table.Cell onClick={() => toggleExpand(o.order_id)}>
                          <a className='link'>
                            <ClientNameCell id={o.id_cli} />
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </a>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap={'1'} align={'center'} wrap={'wrap'}>
                            {products.slice(0, MAX_BADGES).map((sku, index) => (
                              <Badge
                                key={`${sku}-${index}`}
                                color={'gray'}
                                radius={'full'}
                              >
                                {baseCode(sku)}
                              </Badge>
                            ))}
                            {products.length > MAX_BADGES && (
                              <Badge color={'gray'} radius={'full'}>
                                +{products.length - MAX_BADGES}
                              </Badge>
                            )}
                            {products.length === 0 && '—'}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>{formatCurrency(o.total)}</Table.Cell>
                        <Table.Cell>
                          {o.gateway_link ? (
                            <a
                              className='link link-gateway'
                              href={o.gateway_link}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <PaymentStatus
                                status={o.payment_status}
                                payment={o.payment_method}
                              />
                            </a>
                          ) : (
                            <PaymentStatus
                              status={o.payment_status}
                              payment={o.payment_method}
                            />
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <ShippingStatusShop order={o} />
                        </Table.Cell>
                      </Table.Row>
                      {isExpanded && (
                        <Table.Row className='row-order'>
                          <Table.Cell colSpan={7}>
                            <ClientDetailsShop order={o} />
                            <ProductDetailsShop skus={products} />
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </React.Fragment>
                  );
                })
            )}
          </Table.Body>
          <TableFooter>
            <Table.Row>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50]}
                colSpan={7}
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                labelRowsPerPage='Linhas por página:'
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count}`
                }
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    fontSize: '1.1rem',
                    fontFamily: 'Poppins, sans-serif',
                  },
                  '& .MuiTablePagination-selectLabel': {
                    fontSize: '1.1rem',
                    fontFamily: 'Poppins, sans-serif',
                  },
                  '& .MuiTablePagination-input': {
                    fontSize: '1.1rem',
                    fontFamily: 'Poppins, sans-serif',
                  },
                  '& .MuiTablePagination-displayedRows': {
                    fontSize: '1.1rem',
                    fontFamily: 'Poppins, sans-serif',
                  },
                }}
              />
            </Table.Row>
          </TableFooter>
        </Table.Root>
      </ContainerOrder>
    </Theme>
  );
}
