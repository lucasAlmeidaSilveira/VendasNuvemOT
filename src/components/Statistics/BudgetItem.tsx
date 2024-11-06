import React, { useState } from 'react';
import { Loading } from '../Loading';
import { TooltipInfo } from '../TooltipInfo';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { Small } from './styles';
import { formatCurrency, formatDate } from '../../tools/tools';
import { MdOutlineHelpOutline } from 'react-icons/md';
import { BudgetItemListProps, BudgetItemProps } from '../../types';
import { IoReload } from 'react-icons/io5';
import { Popup } from '../Popup';
import {
  Table,
  TableBody,
  TableFooter,
  TablePagination,
  TableRow,
} from '@mui/material';
import {
  EnhancedTableHead,
  StyledTableCell,
  StyledTableRow,
} from '../../tools/table';
import { PaymentStatus } from '../Orders/PaymentStatus';
import { ShippingStatus } from '../Orders/ShippingStatus';
import { ContainerOrder } from '../Orders/styles';
import { TablePaginationActions } from '../Pagination';

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

  return (
    <ContainerOrder>
      <Table aria-label='simple table'>
        <EnhancedTableHead
          order={sort}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <StyledTableCell style={{ textAlign: 'center' }} colSpan={7}>
                Nenhum pedido encontrado
              </StyledTableCell>
            </TableRow>
          ) : (
            orders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order: any) => (
                <>
                  <StyledTableRow
                    key={order.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component='th' scope='row'>
                      #{order.order_id ? order.order_id : order.owner_note}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(new Date(order.created_at))}
                    </StyledTableCell>
                    <StyledTableCell>
                      {order.contact_name}{' '}
                      {/* {expandedOrders[order.id] ? <FaChevronUp /> : <FaChevronDown />} */}
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
                      </a>
                    </StyledTableCell>
                    <StyledTableCell className={'d-row'}>
                      <ShippingStatus
                        order={order}
                        statusOrder={order.status}
                        created_at={order.created_at}
                        shippingMinDays={order.shipping_min_days}
                        shippingMaxDays={order.shipping_max_days}
                        shipping={order.shipping}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                </>
              ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
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
          </TableRow>
        </TableFooter>
      </Table>
    </ContainerOrder>
  );
}
