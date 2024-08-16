import React, { useState, useEffect, useMemo } from 'react';
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
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';

import { useOrders } from '../../context/OrdersContext';
import { formatCurrency } from '../../tools/tools';
import { PaymentStatus } from './PaymentStatus';
import { ShippingStatus } from './ShippingStatus';
import { CustomSelect } from '../CustomSelect';
import { ProductDetails } from './ProductDetails';
import { TablePaginationActions } from '../Pagination';
import { InputSearch } from '../InputSearch';
import { filterOrders } from '../../tools/filterOrders';
import { SelectDatePickerIcon } from '../SelectDatePicker';
import { ClientDetails } from './ClientDetails';
import { TooltipInfo } from '../TooltipInfo';
import { Loading, LoadingIcon } from '../Loading';

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AiFillMessage } from 'react-icons/ai';

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
  '&:nth-of-type(odd):not(.row-order)': {
    backgroundColor: 'var(--geralblack-10)',
  },
  '&.row-order': {
    backgroundColor: 'var(--geralblack-20)',
    borderRadius: '8px',
    '& div': {
      borderRadius: '8px',
    },
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const isLate = order => {
  const shippingDeadline = new Date(order.created_at);
  shippingDeadline.setDate(
    shippingDeadline.getDate() +
      (order.shipping_max_days || order.shipping_min_days),
  );
  return new Date() > shippingDeadline && order.shipping_status !== 'closed' && order.payment_details.method !== 'other';
};

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
};

const headCells = [
  { id: 'order_id', numeric: false, disablePadding: false, label: 'Pedido' },
  { id: 'created_at', numeric: false, disablePadding: false, label: 'Data' },
  { id: 'client', numeric: false, disablePadding: false, label: 'Cliente' },
  { id: 'products', numeric: false, disablePadding: false, label: 'Produtos' },
  { id: 'total', numeric: true, disablePadding: false, label: 'Valor' },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status de Pagamento',
  },
  {
    id: 'shipping_status',
    numeric: false,
    disablePadding: false,
    label: 'Status de Envio',
  },
];

const EnhancedTableHead = props => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <StyledTableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component='span' sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export function Orders() {
  const { allOrders, isLoadingAllOrders, store } = useOrders();
  const [date, setDate] = useState(['2023-11-22', new Date()]);
  const { ordersAllTodayWithPartner } = filterOrders(allOrders, date);
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
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');

  useEffect(() => {
    const unpackedCount = ordersAllTodayWithPartner.filter(
      order =>
        order.shipping_status === 'unpacked' &&
        order.status === 'open' &&
        !isLate(order) &&
        order.payment_status === 'paid',
    ).length;

    const shippedCount = ordersAllTodayWithPartner.filter(
      order =>
        order.shipping_status === 'shipped' &&
        order.status === 'open' &&
        order.payment_status === 'paid',
    ).length;

    const lateCount = ordersAllTodayWithPartner.filter(
      order =>
        isLate(order) &&
        order.status === 'open' &&
        order.payment_status === 'paid',
    ).length;

    setTotalUnpacked(unpackedCount);
    setTotalShipped(shippedCount);
    setTotalLate(lateCount);
  }, [ordersAllTodayWithPartner]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date
      .toLocaleString('default', { month: 'short' })
      .replace('.', '');
    return `${day} ${month}`;
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredOrders = useMemo(() => {
    return stableSort(
      ordersAllTodayWithPartner
        .filter(order => {
          const paymentStatusMatch =
            statusFilter === 'all' || order.payment_status === statusFilter;
          let shippingStatusMatch = shippingStatusFilter === 'all';
          const paymentMethodMatch =
            paymentMethodFilter === 'all' ||
            order.payment_details.method === paymentMethodFilter;

          if (!shippingStatusMatch) {
            switch (shippingStatusFilter) {
              case 'unpacked':
                shippingStatusMatch =
                  order.shipping_status === 'unpacked' &&
                  order.status === 'open' &&
                  !isLate(order);
                break;
              case 'shipped':
                shippingStatusMatch =
                  order.shipping_status === 'shipped' &&
                  order.status === 'open';
                break;
              case 'closed':
                shippingStatusMatch =
                  order.payment_status === 'paid' && order.status === 'closed';
                break;
              case 'late':
                shippingStatusMatch = isLate(order) && order.status === 'open' && order.payment_details.method !== 'other';
                break;
              default:
                shippingStatusMatch = false;
            }
          }

          return (
            paymentStatusMatch && shippingStatusMatch && paymentMethodMatch
          );
        })
        .filter(order => {
          const searchLower = searchQuery.toLowerCase();
          return (
            order.id.toString().toLowerCase().includes(searchLower) ||
            order.order_id.toString().toLowerCase().includes(searchLower) ||
            order.gateway_id?.toString().toLowerCase().includes(searchLower) ||
            order.customer.name.toLowerCase().includes(searchLower) ||
            order.customer.identification.toLowerCase().includes(searchLower) ||
            order.customer.email.toLowerCase().includes(searchLower)
          );
        }),
      getComparator(order, orderBy),
    );
  }, [
    store,
    ordersAllTodayWithPartner,
    statusFilter,
    shippingStatusFilter,
    paymentMethodFilter,
    searchQuery,
    order,
    orderBy,
  ]);

  const handleDateChange = date => {
    setDate(date);
  };

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

  const handleToggleExpand = order_id => {
    setExpandedOrders(prevState => ({
      ...prevState,
      [order_id]: !prevState[order_id],
    }));
  };

  const handleStatusBlockClick = status => {
    setShippingStatusFilter(status);
    setStatusFilter('paid');
  };

  const formatUrlTracking = (urlTracking, code) => {
    if(!urlTracking) {
      return `https://rastreae.com.br/resultado/${code}`;
    }

    return urlTracking
  }

  const minSelectableDate = new Date('2023-11-23');
  const maxSelectableDate = new Date();
  console.log(filteredOrders)

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
          <span>
            {isLoadingAllOrders ? (
              <Loading size={16} color='var(--geralblack-100)' />
            ) : (
              totalUnpacked
            )}
          </span>
        </div>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'shipped' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('shipped')}
        >
          <span>Enviados</span>
          <span>
            {isLoadingAllOrders ? (
              <Loading size={16} color='var(--geralblack-100)' />
            ) : (
              totalShipped
            )}
          </span>
        </div>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'late' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('late')}
        >
          <span>Em atraso</span>
          <span>
            {isLoadingAllOrders ? (
              <Loading size={16} color='var(--geralblack-100)' />
            ) : (
              totalLate
            )}
          </span>
        </div>
      </StatusFilterContainer>
      <FilterContainer>
        <InputSearch
          label='Buscar pedido:'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Busque por nº pedido, nome, CPF, e-mail, cód. transação ou ID'
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
        <SelectDatePickerIcon
          onChange={handleDateChange}
          value={date}
          minDate={minSelectableDate}
          maxDate={maxSelectableDate}
        />
      </FilterContainer>

      <ContainerOrder component={Paper}>
        <Table aria-label='simple table'>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {isLoadingAllOrders ? (
              <TableRow>
                <StyledTableCell style={{ textAlign: 'center' }} colSpan={4}>
                  <LoadingIcon size={16} color='var(--geralblack-100)' />
                </StyledTableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <StyledTableCell style={{ textAlign: 'center' }} colSpan={7}>
                  Nenhum pedido encontrado
                </StyledTableCell>
              </TableRow>
            ) : (
              filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(order => (
                  <>
                    <StyledTableRow
                      key={order.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <StyledTableCell component='th' scope='row'>
                        #{order.order_id}
                      </StyledTableCell>
                      <StyledTableCell>
                        {formatDate(order.created_at)}
                      </StyledTableCell>
                      <StyledTableCell
                        onClick={() => handleToggleExpand(order.id)}
                      >
                        <a className='link'>
                          {order.contact_name}{' '}
                          {expandedOrders[order.id] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                          {order.note && (
                            <TooltipInfo title={order.note}>
                              <span>
                                <AiFillMessage color={'var(--geralblack-80'} />
                              </span>
                            </TooltipInfo>
                          )}
                        </a>
                      </StyledTableCell>
                      <StyledTableCell>{order.products.length}</StyledTableCell>
                      <StyledTableCell>
                        {formatCurrency(parseInt(order.total))}
                      </StyledTableCell>
                      <StyledTableCell>
                        <a
                          className='link link-gateway'
                          href={order.gateway_link}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <PaymentStatus
                            status={order.payment_status}
                            payment={order.payment_details.method}
                          />
                          {order.gateway_name}
                        </a>
                      </StyledTableCell>
                      <StyledTableCell>
                        <ShippingStatus
                          statusOrder={order.status}
                          status={
                            isLate(order)
                              ? 'late'
                              : order.payment_status === 'paid' &&
                                order.status === 'closed'
                              ? 'closed'
                              : order.shipping_status
                          }
                          created_at={order.created_at}
                          shippingMinDays={order.shipping_min_days}
                          shippingMaxDays={order.shipping_max_days}
                          urlTracking={formatUrlTracking(order.shipping_tracking_url, order.shipping_tracking_number)}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                    {expandedOrders[order.id] && (
                      <StyledTableRow className='row-order'>
                        <StyledTableCell colSpan={7}>
                          <ClientDetails order={order} />
                          <ProductDetails products={order.products} />
                        </StyledTableCell>
                      </StyledTableRow>
                    )}
                  </>
                ))
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
