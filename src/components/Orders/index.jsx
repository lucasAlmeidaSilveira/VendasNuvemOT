import React, { useState, useEffect, useMemo } from 'react';
import {
  ContainerOrder,
  FilterContainer,
  Selects,
  StatusFilterContainer,
} from './styles';

import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';

import { useOrders } from '../../context/OrdersContext';
import { formatCurrency, formatDateShort, isLate } from '../../tools/tools';
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
import { Flex, Table, Theme } from '@radix-ui/themes';
import { Popup } from '../Popup';

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
  return stabilizedThis.map((el) => el[0]);
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

const EnhancedTableHead = (props) => {
  const { order, orderBy, onRequestSort } = props;
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

export function Orders() {
  const { allOrders, isLoading, store, setAllOrders, date } = useOrders();
  const { ordersAllTodayWithPartner } = filterOrders(allOrders, date);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
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
  const [layout, setLayout] = useState('auto');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [lateOrdersGrouped, setLateOrdersGrouped] = useState([]);
  const [orderDirection, setOrderDirection] = useState('asc'); // Estado para rastrear a direção da ordenação
  const holidays_br = new Set([
    // Feriados Nacionais
    '2024-01-01', // Confraternização Universal (Ano Novo)
    '2024-02-13', // Carnaval
    '2024-03-29', // Sexta-feira Santa
    '2024-04-07', // Paixão de Cristo
    '2024-04-21', // Tiradentes
    '2024-05-01', // Dia do Trabalho
    '2024-06-20', // Corpus Christi
    '2024-09-07', // Independência do Brasil
    '2024-10-12', // Nossa Senhora Aparecida
    '2024-11-02', // Finados
    '2024-11-15', // Proclamação da República
    '2024-12-25', // Natal

    // Feriados Estaduais
    '2024-07-09', // Revolução Constitucionalista

    // Feriados Municipais
    '2024-01-25', // Aniversário da Cidade de São Paulo
    '2024-11-20', // Consiencia Negra
  ]);

  const handleOpenPopup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handleOpenConfirmPopup = (ownerNote) => {
    setSelectedOwnerNote(ownerNote);
    setOpenConfirmPopup(true);
  };

  const handleIsOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleIsClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleDeleteOrder = async () => {
    if (selectedOwnerNote) {
      setLoadingDelete(true);
      try {
        await deleteOrder(selectedOwnerNote, store);
        setSuccessDelete(true);

        // Atualiza a lista de pedidos removendo o pedido deletado
        setAllOrders((prevOrders) =>
          prevOrders.filter((order) => order.owner_note !== selectedOwnerNote),
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
      (order) =>
        order.shipping_status === 'unpacked' &&
        order.status === 'open' &&
        !isLate(order) &&
        order.payment_status === 'paid',
    );

    const shippedCount = ordersAllTodayWithPartner.filter(
      (order) =>
        order.shipping_status === 'shipped' &&
        order.status === 'open' &&
        order.payment_status === 'paid',
    );

    const lateCount = ordersAllTodayWithPartner.filter(
      (order) =>
        isLate(order) &&
        order.status === 'open' &&
        order.payment_status === 'paid',
    );
    setTotalUnpacked(unpackedCount);
    setTotalShipped(shippedCount);
    setTotalLate(lateCount);
  }, [allOrders, store]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    const filteredOrdersCalc = stableSort(
      ordersAllTodayWithPartner
        .filter((order) => {
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
        .filter((order) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            order.id.toString().toLowerCase().includes(searchLower) ||
            order.order_id?.toString().toLowerCase().includes(searchLower) ||
            order.gateway_id?.toString().toLowerCase().includes(searchLower) ||
            order.customer.name.toLowerCase().includes(searchLower) ||
            order.customer.identification.toLowerCase().includes(searchLower) ||
            order.customer.email.toLowerCase().includes(searchLower) ||
            order.coupon.some((coupon) =>
              coupon.code.toLowerCase().includes(searchLower),
            )
          );
        }),
      getComparator(order, orderBy),
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

  useEffect(() => {
    // Função para checar o tamanho da tela
    const updateLayout = () => {
      if (window.innerWidth >= 768) {
        setLayout('fixed');
      } else {
        setLayout('auto');
      }
    };

    // Chama a função ao carregar a página e ao redimensionar a janela
    updateLayout();
    window.addEventListener('resize', updateLayout);

    // Limpa o event listener ao desmontar o componente
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  /* ----- Inclusão de popup para mensurar atrasos ----- */

  // Função para ordenar os dados
  const sortData = (data, direction) => {
    return data.sort((a, b) => {
      if (direction === 'asc') {
        return new Date(a.date) - new Date(b.date);
      } else {
        return new Date(b.date) - new Date(a.date);
      }
    });
  };

  useEffect(() => {
    if (totalLate) {
      const groupedLateOrders = totalLate.reduce((acc, order) => {
        const date = order.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const result = Object.entries(groupedLateOrders).map(([date, count]) => {
        const daysLate = calculateBusinessDaysLate(date);
        return { date, count, daysLate };
      });
      setLateOrdersGrouped(sortData(result, orderDirection));
    }
  }, [totalLate, orderDirection]);

  // Função para calcular os dias úteis em atraso
  const calculateBusinessDaysLate = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);
    let businessDays = 0;

    while (start < today) {
      const dayOfWeek = start.getDay(); // 0 = Domingo, 6 = Sábado
      const formattedDate = start.toISOString().split('T')[0];

      // Incrementa apenas se for dia útil (não sábado, não domingo, não feriado)
      if (
        dayOfWeek !== 5 &&
        dayOfWeek !== 6 &&
        !holidays_br.has(formattedDate) // Verifica se a data é feriado
      ) {
        businessDays++;
      }
      // Avança para o próximo dia
      start.setDate(start.getDate() + 1);
    }
    return businessDays;
  };

  // Função  para alternar a ordem de classificação
  const toggleSortOrder = () => {
    const newDirection = orderDirection === 'asc' ? 'desc' : 'asc';
    setOrderDirection(newDirection);
    setLateOrdersGrouped((prevData) => sortData([...prevData], newDirection));
  };

  /** ---------- -------- ------------*/

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

  const handleToggleExpand = (order_id) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [order_id]: !prevState[order_id],
    }));
  };

  const handleStatusBlockClick = (status) => {
    setShippingStatusFilter(status);
    setStatusFilter('paid');
  };

  return (
    <Theme>
      <StatusFilterContainer>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'unpacked' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('unpacked')}
        >
          <span>Em produção</span>
          <span>{isLoading ? <Loading /> : totalUnpacked.length}</span>
        </div>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'shipped' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('shipped')}
        >
          <span>Enviados</span>
          <span>{isLoading ? <Loading /> : totalShipped.length}</span>
        </div>
        <div
          className={`status-filter ${
            shippingStatusFilter === 'late' ? 'active' : ''
          }`}
          onClick={() => handleStatusBlockClick('late')}
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
          placeholder="Busque por nº pedido, nome, CPF, e-mail, cupom, cód. transação ou ID"
          totalList={filteredOrders.length}
        />
        {store === 'artepropria' && (
          <Button variant="contained" color="primary" onClick={handleOpenPopup}>
            Cadastrar pedido
          </Button>
        )}
        <Selects>
          <CustomSelect
            label="Status de Envio:"
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'unpacked', label: 'A enviar' },
              { value: 'shipped', label: 'Enviados' },
              { value: 'closed', label: 'Entregues' },
              { value: 'late', label: 'Atrasados' },
            ]}
            value={shippingStatusFilter}
            onChange={(e) => setShippingStatusFilter(e.target.value)}
          />
          <CustomSelect
            label="Status de Pagamento:"
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'paid', label: 'Pagos' },
              { value: 'voided', label: 'Recusados' },
              { value: 'pending', label: 'Pendentes' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <CustomSelect
            label="Meios de Pagamento:"
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'credit_card', label: 'Cartão' },
              { value: 'pix', label: 'Pix' },
              { value: 'boleto', label: 'Boleto' },
              { value: 'other', label: 'Parcerias' },
            ]}
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          />
        </Selects>
      </FilterContainer>

      {shippingStatusFilter === 'late' ? (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleIsOpenPopup}
            style={{ marginBottom: '12px' }}
          >
            Analisar atrasos
          </Button>
        </>
      ) : (
        ''
      )}
      <ContainerOrder>
        <Table.Root variant="surface" layout={layout}>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell justify={'center'} colSpan={4}>
                  <Loading />
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
                .map((order) => (
                  <>
                    <Table.Row
                      key={order.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <Table.Cell>
                        #{order.order_id ? order.order_id : order.owner_note}
                      </Table.Cell>
                      <Table.Cell>
                        {formatDateShort(order.created_at)}
                      </Table.Cell>
                      <Table.Cell onClick={() => handleToggleExpand(order.id)}>
                        <a className="link">
                          {order.contact_name}{' '}
                          {expandedOrders[order.id] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                          {order.note && (
                            <TooltipInfo title={order.note}>
                              <AiFillMessage color={'var(--geralblack-80'} />
                            </TooltipInfo>
                          )}
                        </a>
                      </Table.Cell>
                      <Table.Cell>{order.products.length}</Table.Cell>
                      <Table.Cell>{formatCurrency(order.total)}</Table.Cell>
                      <Table.Cell>
                        <a
                          className="link link-gateway"
                          href={order.gateway_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PaymentStatus
                            status={order.payment_status}
                            payment={order.payment_details.method}
                          />
                          {order.gateway_name}
                        </a>
                      </Table.Cell>
                      <Table.Cell
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
                        {order.storefront === 'Loja Fisica'  && (
                          <Button
                            typeStyle={'delete'}
                            onClick={() =>
                              handleOpenConfirmPopup(order.owner_note)
                            }
                          >
                            <MdDelete size={14} />
                          </Button>
                        )}
                        {order.storefront === 'Loja'  && (
                          <Button
                            typeStyle={'delete'}
                            onClick={() =>
                              handleOpenConfirmPopup(order.owner_note)
                            }
                          >
                            <MdDelete size={14} />
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                    {expandedOrders[order.id] && (
                      <Table.Row className="row-order">
                        <Table.Cell colSpan={7}>
                          <ClientDetails order={order} />
                          <ProductDetails products={order.products} />
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </>
                ))
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
      <Popup
        open={isPopupOpen}
        onClose={handleIsClosePopup}
        size="lg"
        title="Pedidos em Atraso"
      >
        <Theme>
          <Table.Root variant="surface" layout={layout}>
            <Table.Header style={{ backgroundColor: 'lightgray' }}>
              <Table.Row>
                <Table.ColumnHeaderCell
                  onClick={toggleSortOrder}
                  style={{ cursor: 'pointer' }}
                >
                  <Flex align={'center'} gap={'1'}>
                    Data
                    {orderDirection === 'asc' ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </Flex>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Quantidade de Pedidos
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Dias de Atraso</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell justify={'center'} colSpan={4}>
                    <Loading />
                  </Table.Cell>
                </Table.Row>
              ) : lateOrdersGrouped.length === 0 ? (
                <Table.Row>
                  <Table.Cell justify={'center'} colSpan={7}>
                    Nenhum pedido em atraso
                  </Table.Cell>
                </Table.Row>
              ) : (
                lateOrdersGrouped.map(({ date, count, daysLate }, index) => (
                  <Table.Row key={index} className="row-order">
                    <Table.Cell>{date}</Table.Cell>
                    <Table.Cell>{count}</Table.Cell>
                    <Table.Cell>
                      {daysLate === 3
                        ? 'hoje'
                        : `${daysLate - 3} ${daysLate - 3 === 1 ? 'dia' : 'dias'}`}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Theme>
      </Popup>
    </Theme>
  );
}
