import React, { useState, useEffect } from 'react';
import {
  ContainerOrder,
  FilterContainer,
  Selects,
  StatusFilterContainer,
} from './styles';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useOrders } from '../../context/OrdersContext';
import { formatCurrency } from '../../tools/tools';
import { PaymentStatus } from './PaymentStatus';
import { ShippingStatus } from './ShippingStatus';
import { CustomSelect } from '../CustomSelect';
import { ProductDetails } from './ProductDetails';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import { TablePaginationActions } from '../Pagination';
import { InputSearch } from '../InputSearch';
import { filterOrdersAll } from '../../tools/filterOrders';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'var(--geralblack-30)',
    color: 'var(--geralblack-100)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Poppins',
    padding: '14px 16px',
    whiteSpace: 'collapse',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: 'Poppins',
    padding: '8px 16px',
    lineHeight: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'collapse',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'var(--geralblack-10)',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const isLate = order => {
  const shippingDeadline = new Date(order.createdAt);
  shippingDeadline.setDate(
    shippingDeadline.getDate() +
      (order.data.shipping_max_days || order.data.shipping_min_days),
  );
  return (
    new Date() > shippingDeadline && order.data.shipping_status !== 'closed'
  );
};

export function Orders() {
  const { allOrders, date, isLoading } = useOrders();
  const { ordersAllList } = filterOrdersAll(allOrders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [shippingStatusFilter, setShippingStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [totalUnpacked, setTotalUnpacked] = useState(0);
  const [totalShipped, setTotalShipped] = useState(0);
  const [totalLate, setTotalLate] = useState(0);

  useEffect(() => {
    const unpackedCount = ordersAllList.filter(
      order =>
        order.data.shipping_status === 'unpacked' &&
        order.data.status === 'open' &&
        !isLate(order) &&
        order.status === 'paid'
    ).length;

    const shippedCount = ordersAllList.filter(
      order =>
        order.data.shipping_status === 'shipped' &&
        order.data.status === 'open' &&
        order.status === 'paid'
    ).length;

    const lateCount = ordersAllList.filter(
      order =>
        isLate(order) &&
        order.data.status === 'open' &&
        order.status === 'paid'
    ).length;

    setTotalUnpacked(unpackedCount);
    setTotalShipped(shippedCount);
    setTotalLate(lateCount);
  }, [ordersAllList]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date
      .toLocaleString('default', { month: 'short' })
      .replace('.', '');
    return `${day} ${month}`;
  };

  const filteredOrders = ordersAllList
    .filter(order => {
      const paymentStatusMatch =
        statusFilter === 'all' || order.status === statusFilter;
      let shippingStatusMatch = shippingStatusFilter === 'all';
      const paymentMethodMatch =
        paymentMethodFilter === 'all' ||
        order.data.payment_details.method === paymentMethodFilter;

      if (!shippingStatusMatch) {
        switch (shippingStatusFilter) {
          case 'unpacked':
            shippingStatusMatch =
              order.data.shipping_status === 'unpacked' &&
              order.data.status === 'open' &&
              !isLate(order);
            break;
          case 'shipped':
            shippingStatusMatch =
              order.data.shipping_status === 'shipped' &&
              order.data.status === 'open';
            break;
          case 'closed':
            shippingStatusMatch =
              order.status === 'paid' && order.data.status === 'closed';
            break;
          case 'late':
            shippingStatusMatch = isLate(order) && order.data.status === 'open';
            break;
          default:
            shippingStatusMatch = false;
        }
      }

      return paymentStatusMatch && shippingStatusMatch && paymentMethodMatch;
    })
    .filter(order => {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.id.toString().toLowerCase().includes(searchLower) ||
        order.data.customer.name.toLowerCase().includes(searchLower) ||
        order.data.customer.identification
          .toLowerCase()
          .includes(searchLower) ||
        order.data.customer.email.toLowerCase().includes(searchLower)
      );
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleExpand = orderId => {
    setExpandedOrders(prevState => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const handleStatusBlockClick = status => {
    setShippingStatusFilter(status);
    setStatusFilter('paid');
  };

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredOrders.length - page * rowsPerPage);

  return (
    <>
      <StatusFilterContainer>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'unpacked' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('unpacked')}
        >
          <span>Em produção</span>
          <span>{totalUnpacked}</span>
        </div>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'shipped' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('shipped')}
        >
          <span>Enviados</span>
          <span>{totalShipped}</span>
        </div>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'late' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('late')}
        >
          <span>Em atraso</span>
          <span>{totalLate}</span>
        </div>
      </StatusFilterContainer>
      <FilterContainer>
        <InputSearch
          label='Buscar pedido:'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Busque por nome, CPF, e-mail, ou ID'
          totalList={filteredOrders.length}
        />
        <Selects>
        <CustomSelect
            label='Status de Envio:'
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'unpacked', label: 'A enviar' },
              { value: 'shipped', label: 'Enviados' },
              { value: 'closed', label: 'Entregues' },
              { value: 'late', label: 'Atrasados' },
            ]}
            value={shippingStatusFilter}
            onChange={e => setShippingStatusFilter(e.target.value)}
          />
          <CustomSelect
            label='Status de Pagamento:'
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'paid', label: 'Pagos' },
              { value: 'voided', label: 'Recusados' },
              { value: 'pending', label: 'Pendentes' },
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
            onChange={e => setPaymentMethodFilter(e.target.value)}
          />
        </Selects>
      </FilterContainer>

      <ContainerOrder component={Paper}>
        <Table aria-label='simple table'>
          <TableHead>
            <TableRow>
              <StyledTableCell>Pedido</StyledTableCell>
              <StyledTableCell>Data</StyledTableCell>
              <StyledTableCell>Cliente</StyledTableCell>
              <StyledTableCell>Produtos</StyledTableCell>
              <StyledTableCell>Valor</StyledTableCell>
              <StyledTableCell>Status de Pagamento</StyledTableCell>
              <StyledTableCell>Status de Envio</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(order => (
                <>
                  <StyledTableRow
                    key={order.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component='th' scope='row'>
                      #{order.orderId}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(order.createdAt)}
                    </StyledTableCell>
                    <StyledTableCell>{order.client}</StyledTableCell>
                    <StyledTableCell
                      onClick={() => handleToggleExpand(order.id)}
                    >
                      <a className='link'>
                        Ver {order.products.length}{' '}
                        {expandedOrders[order.id] ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </a>
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatCurrency(parseInt(order.total))}
                    </StyledTableCell>
                    <StyledTableCell>
                      <a
                        className='link link-gateway'
                        href={order.gatewayLink}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <PaymentStatus
                          status={order.status}
                          payment={order.data.payment_details.method}
                        />
                        {order.gateway}
                      </a>
                    </StyledTableCell>
                    <StyledTableCell>
                      <ShippingStatus
                        statusOrder={order.statusOrder}
                        status={
                          isLate(order)
                            ? 'late'
                            : order.status === 'paid' &&
                              order.statusOrder === 'closed'
                            ? 'closed'
                            : order.data.shipping_status
                        }
                        createdAt={order.createdAt}
                        shippingMinDays={order.data.shipping_min_days}
                        shippingMaxDays={order.data.shipping_max_days}
                        urlTracking={order.data.shipping_tracking_url}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                  {expandedOrders[order.id] && (
                    <StyledTableRow>
                      <StyledTableCell colSpan={7}>
                        <ProductDetails products={order.products} />
                      </StyledTableCell>
                    </StyledTableRow>
                  )}
                </>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <StyledTableCell colSpan={7} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
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
            </TableRow>
          </TableFooter>
        </Table>
      </ContainerOrder>
    </>
  );
}