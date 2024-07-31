import React, { useEffect, useState } from 'react';
import { ContainerCoupon } from './styles';
import { useOrders } from '../../context/OrdersContext';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import { TablePaginationActions } from '../Pagination';
import { formatDateToISO } from '../../tools/tools';
import { LoadingIcon } from '../Loading';

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
    padding: '14px 16px',
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

export function Coupons() {
  const { orders, date, isLoading } = useOrders();
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const startDateISO = formatDateToISO(date[0]);
    const endDateISO = formatDateToISO(date[1]);

    const couponUsageMap = {};

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (
        orderDate >= new Date(startDateISO) &&
        orderDate <= new Date(endDateISO)
      ) {
        order.coupon.forEach(coupon => {
          if (!couponUsageMap[coupon.code]) {
            couponUsageMap[coupon.code] = {
              ...coupon,
              used: 0,
            };
          }
          couponUsageMap[coupon.code].used += 1;
        });
      }
    });

    const sortedCoupons = Object.values(couponUsageMap).sort(
      (a, b) => b.used - a.used,
    );

    setFilteredCoupons(sortedCoupons);
  }, [orders]);

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

  return (
    <ContainerCoupon component={Paper}>
      <Table aria-label='simple table'>
        <TableHead>
          <TableRow>
            <StyledTableCell>Código</StyledTableCell>
            <StyledTableCell>Valor</StyledTableCell>
            <StyledTableCell>Usado</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <StyledTableCell style={{ textAlign: 'center' }} colSpan={4}>
                <LoadingIcon size={16} color='var(--geralblack-100)' />
              </StyledTableCell>
            </TableRow>
          ) : filteredCoupons.length === 0 ? (
            <TableRow>
              <StyledTableCell style={{ textAlign: 'center' }} colSpan={7}>
                Nenhum cupom usado
              </StyledTableCell>
            </TableRow>
          ) : (
            filteredCoupons
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(coupon => (
                <StyledTableRow
                  key={coupon.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <StyledTableCell component='th' scope='row'>
                    {coupon.code}
                  </StyledTableCell>
                  {coupon.type === 'percentage' ? (
                    <StyledTableCell>{`${parseInt(coupon.value)}%`}</StyledTableCell>
                  ) : (
                    <StyledTableCell>{`R$ ${parseFloat(coupon.value).toFixed(2).replace('.', ',')}`}</StyledTableCell>
                  )}
                  <StyledTableCell>{coupon.used}</StyledTableCell>
                </StyledTableRow>
              ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              colSpan={7}
              count={filteredCoupons.length}
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
    </ContainerCoupon>
  );
}
