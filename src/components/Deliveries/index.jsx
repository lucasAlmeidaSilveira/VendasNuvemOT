import React, { useState, useEffect, useMemo } from 'react';
import {
  ContainerDelivery,
  FilterContainer,
  StatusFilterContainer,
} from './styles';
import { DeliveryStatus } from './DeliveryStatus';
import { useOrders } from '../../context/OrdersContext';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { formatCurrency, formatDateShort } from '../../tools/tools';
import { TablePaginationActions } from '../Pagination';
import { Table, Theme, Flex } from '@radix-ui/themes';
import { InputSearch } from '../InputSearch';
import { Loading } from '../Loading';

// Funções de ordenação
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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
  return stabilizedThis.map((el) => el[0]);
};

const headCells = [
  { id: 'id', numeric: true, disablePadding: false, label: 'ID' },
  {
    id: 'order_id',
    numeric: false,
    disablePadding: false,
    label: 'Número do Pedido',
  },
  {
    id: 'name_client',
    numeric: false,
    disablePadding: false,
    label: 'Nome Cliente',
  },
  {
    id: 'lastDate',
    numeric: false,
    disablePadding: false,
    label: 'Data da última movimentação',
  },
  {
    id: 'rastreio',
    numeric: false,
    disablePadding: false,
    label: 'Número de rastreio',
  },
  { id: 'total', numeric: true, disablePadding: false, label: 'Valor' },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status da Entrega',
  },
];

const EnhancedTableHead = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <Table.Header style={{ backgroundColor: 'lightgray' }}>
      <Table.Row>
        {headCells.map((headCell) => (
          <Table.ColumnHeaderCell
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
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </Table.ColumnHeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
};

export function Deliveries() {
  const { isLoading, store, date } = useOrders();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [layout, setLayout] = useState('auto');
  const [totalOK, setTotalOK] = useState(0);
  const [totalLate, setTotalLate] = useState(0);
  const [shippingStatusFilter, setShippingStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dados de teste
  const testMap = [
    {
      id: 123,
      order_id: '345',
      name_client: 'Teste',
      lastDate: '2025-06-17T11:36:57.000Z',
      rastreio: '00007525473',
      total: 99.0,
      status: 'OK',
      store: 'artepropria',
    },
    {
      id: 111,
      order_id: '346',
      name_client: 'Teste 2',
      lastDate: '2025-06-17T12:36:57.000Z',
      rastreio: '00054254238',
      total: 150.5,
      status: 'OK',
      store: 'artepropria',
    },
    {
      id: 456,
      order_id: '456',
      name_client: 'Teste 3',
      lastDate: '2025-06-16T10:30:00.000Z',
      rastreio: '00452454238',
      total: 200.0,
      status: 'OK',
      store: 'outlet',
    },
    {
      id: 856,
      order_id: '856',
      name_client: 'Teste 4',
      lastDate: '2025-06-14T11:36:57.000Z',
      rastreio: '00004545631',
      total: 119.0,
      status: 'NOK',
      store: 'artepropria',
    },
    {
      id: 151,
      order_id: '666',
      name_client: 'Teste 5',
      lastDate: '2025-06-17T12:36:57.000Z',
      rastreio: '00055785261',
      total: 120.5,
      status: 'OK',
      store: 'outlet',
    },
    {
      id: 744,
      order_id: '777',
      name_client: 'Teste 6',
      lastDate: '2025-06-15T10:30:00.000Z',
      rastreio: '00077775557',
      total: 500.0,
      status: 'NOK',
      store: 'outlet',
    },
  ];

  // Aplicar ordenação
  const sortedData = useMemo(() => {
    return stableSort(filteredOrders, getComparator(order, orderBy));
  }, [filteredOrders, order, orderBy]);

  // Paginação
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [sortedData, page, rowsPerPage]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleStatusBlockClick = (status) => {
    setShippingStatusFilter(status);
  };

  useEffect(() => {
    const filteredOrdersCalc = stableSort(
      testMap
        .filter((order) => {
          //const paymentStatusMatch =
          // statusFilter === 'all' || order.payment_status === statusFilter;
          let shippingStatusMatch = shippingStatusFilter === 'all';

          if (!shippingStatusMatch) {
            switch (shippingStatusFilter) {
              case 'OK':
                shippingStatusMatch = order.status === 'OK';
                break;
              case 'NOK':
                shippingStatusMatch = order.status === 'NOK';
                break;
              default:
                shippingStatusMatch = false;
            }
          }

          return shippingStatusMatch;
        })
        .filter((order) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            order.id.toString().toLowerCase().includes(searchLower) ||
            order.order_id?.toString().toLowerCase().includes(searchLower) ||
            order.name_client?.toString().toLowerCase().includes(searchLower) ||
            order.rastreio.toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower)
          );
        }),
      getComparator(order, orderBy),
    );

    setFilteredOrders(filteredOrdersCalc); // Atualiza o estado com os pedidos filtrados
  }, [store, shippingStatusFilter, searchQuery]);

  useEffect(() => {
    const unpackedCount = testMap.filter((order) => order.status === 'OK');
    const lateCount = testMap.filter((order) => order.status === 'NOK');
    setTotalOK(unpackedCount);
    setTotalLate(lateCount);
  }, [store, date]);

  useEffect(() => {
    const updateLayout = () => {
      setLayout(window.innerWidth >= 768 ? 'fixed' : 'auto');
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return (
    <Theme>
      <StatusFilterContainer>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'OK' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('OK')}
        >
          <span>No Prazo</span>
          <span>{isLoading ? <Loading /> : totalOK.length}</span>
        </div>

        <div
          className={`status-filter ${
            shippingStatusFilter === 'NOK' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('NOK')}
        >
          <span>Em atraso</span>
          <span>{isLoading ? <Loading /> : totalLate.length}</span>
        </div>
      </StatusFilterContainer>
      <FilterContainer>
        <InputSearch
          label="Buscar pedido:"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busque por nº do pedido, nome do cliente, nº de rastreio ou ID"
          totalList={filteredOrders.length}
        />
      </FilterContainer>
      <ContainerDelivery>
        <Table.Root variant="surface" layout={layout}>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />

          <Table.Body>
            {testMap.length === 0 ? (
              <Table.Row>
                <Table.Cell justify={'center'} colSpan={8}>
                  Nenhum pedido encontrado
                </Table.Cell>
              </Table.Row>
            ) : (
              paginatedData.map((order) => (
                <Table.Row
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <Table.Cell>{order.id}</Table.Cell>
                  <Table.Cell>#{order.order_id}</Table.Cell>
                  <Table.Cell>{order.name_client}</Table.Cell>
                  <Table.Cell>{formatDateShort(order.lastDate)}</Table.Cell>
                  <Table.Cell>
                    <a
                      className="link link-gateway"
                      href={order.rastreio}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {order.rastreio}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{formatCurrency(order.total)}</Table.Cell>
                  <Table.Cell>
                    <Flex gap={'1'} align={'center'}>
                      <DeliveryStatus
                        statusOrder={order.status}
                        shipping={
                          order.status === 'OK' ? 'No Prazo' : 'Em Atraso'
                        }
                      />
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
          <TableFooter>
            <Table.Row>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50]}
                colSpan={7}
                count={testMap.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                labelRowsPerPage="Linhas por página:"
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
      </ContainerDelivery>
    </Theme>
  );
}
