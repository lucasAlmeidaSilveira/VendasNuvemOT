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
import { formatCurrency, isLate } from '../../tools/tools';
import { PaymentStatus } from './PaymentStatus';
import { ShippingStatus } from './ShippingStatus';
import { CustomSelect } from '../CustomSelect';
import { ProductDetails } from './ProductDetails';
import { TablePaginationActions } from '../Pagination';
import { InputSearch } from '../InputSearch';
import { filterOrders } from '../../tools/filterOrders';
import { ClientDetails } from './ClientDetails';
import { TooltipInfo } from '../TooltipInfo';
import { Loading } from '../Loading';

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { AiFillMessage } from 'react-icons/ai';
import { OrderPopup } from './OrderPopup';
import { Button } from '../Button';
import { deleteOrder } from '../../api';
import { ConfirmationDialog } from '../Products/ConfirmationDialog';

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
  [`&.${'d-row'}`]: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '16px'
  }
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
    label: 'Pagamento',
  },
  {
    id: 'shipping_status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
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
  const { allOrders, isLoading, store, setAllOrders, date } = useOrders();
  const { ordersAllTodayWithPartner } = filterOrders(allOrders, date);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([])
  const [shippingStatusFilter, setShippingStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalUnpacked, setTotalUnpacked] = useState(0);
  const [totalShipped, setTotalShipped] = useState(0);
  const [totalLate, setTotalLate] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [openPopup, setOpenPopup] = useState(false);
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const [selectedOwnerNote, setSelectedOwnerNote] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [successDelete, setSuccessDelete] = useState(false);

  const handleOpenPopup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handleOpenConfirmPopup = ownerNote => {
    setSelectedOwnerNote(ownerNote);
    setOpenConfirmPopup(true);
  };

  const handleDeleteOrder = async () => {
    if (selectedOwnerNote) {
      setLoadingDelete(true);
      try {
        await deleteOrder(selectedOwnerNote, store);
        setSuccessDelete(true);

        // Atualiza a lista de pedidos removendo o pedido deletado
        setAllOrders(prevOrders =>
          prevOrders.filter(order => order.owner_note !== selectedOwnerNote),
        );

        // Após um tempo de confirmação, fechar o popup e resetar os estados
        setTimeout(() => {
          setLoadingDelete(false);
          setSuccessDelete(false);
          setOpenConfirmPopup(false);
          setSelectedOwnerNote(null); // Limpa o ownerNote selecionado após a exclusão
        }, 1000); // Espera 1 segundo para dar feedback visual do sucesso
      } catch (error) {
        setLoadingDelete(false);
        setSuccessDelete(false);
        console.error('Erro ao deletar o pedido:', error);
      }
    }
  };

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
  }, [allOrders, store]);

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


  useEffect(() => {
    const filteredOrdersCalc = stableSort(
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
                shippingStatusMatch =
                  isLate(order) &&
                  order.status === 'open' &&
                  order.payment_details.method !== 'other';
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
            order.order_id?.toString().toLowerCase().includes(searchLower) ||
            order.gateway_id?.toString().toLowerCase().includes(searchLower) ||
            order.customer.name.toLowerCase().includes(searchLower) ||
            order.customer.identification.toLowerCase().includes(searchLower) ||
            order.customer.email.toLowerCase().includes(searchLower)
          );
        }),
      getComparator(order, orderBy)
    );

    setFilteredOrders(filteredOrdersCalc); // Atualiza o estado com os pedidos filtrados
  }, [
    allOrders,
    store,
    statusFilter,
    shippingStatusFilter,
    paymentMethodFilter,
    searchQuery,
    order,
    orderBy,
  ]);

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
            {isLoading ? (
              <Loading />
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
            {isLoading ? (
              <Loading />
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
            {isLoading ? (
              <Loading />
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
        {store === 'artepropria' && (
          <Button variant='contained' color='primary' onClick={handleOpenPopup}>
            Cadastrar pedido
          </Button>
        )}
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
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <StyledTableCell style={{ textAlign: 'center' }} colSpan={4}>
                  <Loading />
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
                        #{order.order_id ? order.order_id : order.owner_note}
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
                        {formatCurrency(order.total)}
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
                      <StyledTableCell 
                        className={order.storefront === 'Loja' && 'd-row'}
                      >
                        <ShippingStatus
                          order={order}
                          statusOrder={order.status}
                          created_at={order.created_at}
                          shippingMinDays={order.shipping_min_days}
                          shippingMaxDays={order.shipping_max_days}
                          shipping={order.shipping}
                        />
                        {order.storefront === 'Loja' && (
                          <Button
                            typeStyle={'delete'}
                            onClick={() =>
                              handleOpenConfirmPopup(order.owner_note)
                            }
                          >
                            <MdDelete size={14} />
                          </Button>
                        )}
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

      <OrderPopup open={openPopup} onClose={handleClosePopup} />
      <ConfirmationDialog
        open={openConfirmPopup}
        onClose={() => setOpenConfirmPopup(false)}
        onConfirm={handleDeleteOrder}
        loading={loadingDelete}
        success={successDelete}
        action={'Excluir'}
      />
    </>
  );
}
