import React, { useState } from 'react';
import { Loading } from '../Loading';
import { TooltipInfo } from '../TooltipInfo';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { Small, ContainerTable } from './styles';
import { formatCurrency, formatDateShort } from '../../tools/tools';
import { MdOutlineHelpOutline } from 'react-icons/md';
import { BudgetItemListProps, BudgetItemProps } from '../../types';
import { IoReload } from 'react-icons/io5';
import { Popup } from '../Popup';
import { EnhancedTableHead } from '../../tools/table';
import { PaymentStatus } from '../Orders/PaymentStatus';
import { ClientDetails } from '../Orders/ClientDetails';
import { ProductDetails } from '../Orders/ProductDetails';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Flex, Table, Theme } from '@radix-ui/themes';

export function BudgetItemList({
  icon: Icon,
  iconColor = 'var(--geralblack-100)',
  dataCosts,
  title,
  tooltip,
  info,
  value,
  isLoading,
  small,
  handleAction,
  orders,
}: BudgetItemListProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    if (orders) {
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className={`div ${orders && 'orders'}`} onClick={handleOpenPopup}>
        <div className='title-box'>
          {Icon && <Icon color={iconColor} fontSize={18} />}
          <p className='text-wrapper-2'>{title}</p>
          <TooltipInfo title={tooltip}>
            <IoMdInformationCircleOutline size={16} color={'#1F1F1F'} />
          </TooltipInfo>
          {handleAction && (
            <TooltipInfo className={'btn-reload'} title={'Recarregar dados'}>
              <IoReload size={16} onClick={handleAction} />
            </TooltipInfo>
          )}
        </div>
        <div className='text-wrapper-4'>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <div>
                {value}
                {small && <Small>({small})</Small>}
                {info && (
                  <TooltipInfo title={info}>
                    <MdOutlineHelpOutline size={16} color={'#1F1F1F'} />
                  </TooltipInfo>
                )}
              </div>
              <div className='column-list'>
                {dataCosts &&
                  dataCosts.map((data, index) => (
                    <div key={index} className='row-list'>
                      <span
                        style={
                          data.name === 'Total'
                            ? {
                                fontWeight: 'bold',
                                color: 'var(--geralblack-80)',
                              }
                            : { fontWeight: 'inherit' }
                        }
                      >
                        {title === 'ROAS'
                          ? data.value
                          : formatCurrency(data.value)}
                      </span>
                      <span
                        style={
                          data.name === 'Total'
                            ? {
                                fontWeight: 'bold',
                                color: 'var(--geralblack-80)',
                              }
                            : { fontWeight: 'normal' }
                        }
                      >
                        {data.name}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Popup
        open={isPopupOpen}
        onClose={handleClosePopup}
        size='lg'
        title='Pedidos'
      >
        <TableOrders orders={orders} />
      </Popup>
    </>
  );
}

export function BudgetItem({
  icon: Icon,
  iconColor,
  bullet,
  title,
  tooltip,
  value,
  orders,
  isLoading,
  small,
  info,
}: BudgetItemProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    if (orders) {
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className={`div ${orders && 'orders'}`} onClick={handleOpenPopup}>
        <div className='title-box'>
          {Icon && <Icon color={iconColor} fontSize={18} />}
          <p className='text-wrapper-2'>{title}</p>
          <TooltipInfo title={tooltip}>
            <IoMdInformationCircleOutline size={16} color={'#1F1F1F'} />
          </TooltipInfo>
          {bullet && <span className={bullet} />}
        </div>
        <div className='text-wrapper-3'>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {value}
              {small && <Small>({small})</Small>}
              {info && (
                <TooltipInfo title={info}>
                  <MdOutlineHelpOutline size={16} color={'#1F1F1F'} />
                </TooltipInfo>
              )}
            </>
          )}
        </div>
      </div>
      <Popup
        open={isPopupOpen}
        onClose={handleClosePopup}
        size='lg'
        title='Pedidos'
      >
        <TableOrders orders={orders} />
      </Popup>
    </>
  );
}

function TableOrders({ orders }: any) {
  const [sort, setSort] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedOrders, setExpandedOrders] = useState({});

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && sort === 'asc';
    setSort(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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

  return (
    <Theme style={{ minHeight: '10%' }}>
      <ContainerTable>
          <Table.Root variant='surface' layout={'auto'}>
            <EnhancedTableHead
              order={sort}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <Table.Body>
              {orders.length === 0 ? (
                <Table.Row>
                  <Table.Cell align='center' colSpan={6}>
                    Nenhum pedido encontrado
                  </Table.Cell>
                </Table.Row>
              ) : (
                orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order: any) => (
                    <>
                      <Table.Row key={order.id} align={'center'}>
                        <Table.Cell p={'4'}>
                          #{order.order_id ? order.order_id : order.owner_note}
                        </Table.Cell>
                        <Table.Cell p={'4'}>
                          {formatDateShort(order.created_at)}
                        </Table.Cell>
                        <Table.Cell
                          p={'4'}
                          onClick={() => handleToggleExpand(order.id)}
                        >
                          <a className='link'>
                            {order.contact_name}{' '}
                            {expandedOrders[order.id] ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </a>
                        </Table.Cell>
                        <Table.Cell p={'4'}>{order.products.length}</Table.Cell>
                        <Table.Cell p={'4'}>
                          {formatCurrency(order.total)}
                        </Table.Cell>
                        <Table.Cell p={'4'}>
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
                          </a>
                        </Table.Cell>
                      </Table.Row>
                      {expandedOrders[order.id] && (
                        <Table.Row className='row-order'>
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
            {/* <TableFooter>
          <Table.Row>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              colSpan={7}
              count={orders.length}
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
        </TableFooter> */}
          </Table.Root>
      </ContainerTable>
    </Theme>
  );
}
