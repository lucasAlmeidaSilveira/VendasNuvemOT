import React, { useEffect, useMemo, useState } from 'react';
import { ContainerCoupon } from './styles';
import { useOrders } from '../../context/OrdersContext';
import { useAuth } from '../../context/AuthContext';
import { useDatabaseContext } from '../../context/DbContext';
import { DatabaseTable } from '../../types';
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
import { formatCurrency, formatDate } from '../../tools/tools';
import { Loading } from '../Loading';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';

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
  // `date` e `store` vêm do OrdersContext (filtros globais de período/loja).
  // A loja agora também escopa a busca: os cupons são consumidos pela rota
  // /db/query/coupon/:store/:start/:end (store no path). Além disso, ela
  // controla a exibição do filtro de cupons de vendedores (só 'artepropria').
  const { date, store } = useOrders();
  const { user } = useAuth();
  const { state, fetchData, reloadKey } = useDatabaseContext();
  const { data, loading, error, currentTable } = state;

  // Loading efetivo: enquanto o estado compartilhado do DbContext ainda não
  // aponta para coupon (null no 1º paint, ou a tabela da aba anterior) ou está
  // carregando, mostramos spinner em vez de piscar "Nenhum cupom usado".
  const isBusy = loading || currentTable !== DatabaseTable.COUPON;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSellerFilterActive, setIsSellerFilterActive] = useState(false);

  // Cupons de vendedores
  const couponsSellers = [
    'CIBELEAP',
    'CLAUDIOAP',
    'DIEGOAP',
    'IAGOAP',
    'YARAAP',
    'DIEGOBLACKAP',
    'YARABLACKAP',
    'IAGOBLACKAP',
    'CLAUDIOBLACKAP',
    'CIBELEBLACKAP',
    'CIBELE5',
    'CLAUDIO5',
    'DIEGO5',
    'IAGO5',
    'YARA5',
    'CIBELE10',
    'CLAUDIO10',
    'DIEGO10',
    'IAGO10',
    'YARA10',
    'CIBELE15',
    'CLAUDIO15',
    'DIEGO15',
    'IAGO15',
    'YARA15',
    'LARISSA5',
    'LARISSA10',
    'LARISSA15',
  ];

  // Busca os cupons do novo backend sempre que período OU loja mudam.
  // Rota: /db/query/coupon/:store/:start/:end — a loja faz parte do path e os
  // cupons já voltam escopados por loja. Como o período pode abranger vários
  // dias (agregação por (name, date_coupon)), somamos por nome abaixo.
  useEffect(() => {
    if (!user) return; // aguarda autenticação; refetch quando `user` muda
    const startDate = formatDate(date[0]);
    const endDate = formatDate(date[1]);
    fetchData(DatabaseTable.COUPON, { startDate, endDate, store });
    setPage(0);
  }, [date, store, user, fetchData, reloadKey]);

  // Como o período pode abranger vários dias, agregamos as linhas diárias por
  // nome do cupom: soma de usos (quantity), de faturamento (total_money) e de
  // desconto (total_discount).
  const filteredCoupons = useMemo(() => {
    if (currentTable !== DatabaseTable.COUPON || !Array.isArray(data)) {
      return [];
    }

    const couponUsageMap = {};

    data.forEach((coupon) => {
      if (isSellerFilterActive && !couponsSellers.includes(coupon.name)) {
        return; // Mostra apenas cupons de vendedores quando o filtro está ativo
      }

      if (!couponUsageMap[coupon.name]) {
        couponUsageMap[coupon.name] = {
          name: coupon.name,
          used: 0,
          totalRevenue: 0,
          discountValue: 0,
          // Tipo do cupom ('percentage' | 'absolute') para render type-aware, igual ao legado.
          discountType: coupon.discount_type || 'percentage',
        };
      }
      couponUsageMap[coupon.name].used += Number(coupon.quantity) || 0;
      couponUsageMap[coupon.name].totalRevenue += Number(coupon.total_money) || 0;
      if (coupon.discount_type) {
        couponUsageMap[coupon.name].discountType = coupon.discount_type;
      }
      // total_discount é o VALOR FIXO do cupom (campo `value`), repetido em cada linha —
      // NÃO somar. Mantemos o maior valor visto no período.
      couponUsageMap[coupon.name].discountValue = Math.max(
        couponUsageMap[coupon.name].discountValue,
        Number(coupon.total_discount) || 0,
      );
    });

    return Object.values(couponUsageMap).sort((a, b) => b.used - a.used);
  }, [data, currentTable, isSellerFilterActive]);

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

  const handleSellerFilterChange = (event) => {
    setIsSellerFilterActive(event.target.checked);
    setPage(0);
  };

  return (
    <>
      {store === 'artepropria' && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSellerFilterActive}
                onChange={handleSellerFilterChange}
                inputProps={{ 'aria-label': 'controlled' }}
                size="large"
              />
            }
            label={
              <Typography
                variant="subtitle1"
                style={{
                  fontFamily: 'Poppins',
                  color: 'var(--geralblack-100)',
                  fontSize: 12,
                }}
              >
                Mostrar somente cupons de vendedores
              </Typography>
            }
          />
        </FormGroup>
      )}
      <ContainerCoupon component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Código</StyledTableCell>
              <StyledTableCell>Desconto</StyledTableCell>
              <StyledTableCell>Faturamento</StyledTableCell>
              <StyledTableCell>Usado</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isBusy ? (
              <TableRow>
                <StyledTableCell style={{ textAlign: 'center' }} colSpan={4}>
                  <Loading />
                </StyledTableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <StyledTableCell style={{ textAlign: 'center' }} colSpan={4}>
                  Não foi possível carregar os cupons.
                </StyledTableCell>
              </TableRow>
            ) : filteredCoupons.length === 0 ? (
              <TableRow>
                <StyledTableCell style={{ textAlign: 'center' }} colSpan={4}>
                  Nenhum cupom usado
                </StyledTableCell>
              </TableRow>
            ) : (
              filteredCoupons
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((coupon) => (
                  <StyledTableRow
                    key={coupon.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <StyledTableCell component="th" scope="row">
                      {coupon.name}
                    </StyledTableCell>
                    <StyledTableCell>
                      {coupon.discountType === 'percentage'
                        ? `${parseInt(coupon.discountValue)}%`
                        : `R$ ${parseFloat(coupon.discountValue)
                            .toFixed(2)
                            .replace('.', ',')}`}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatCurrency(coupon.totalRevenue)}
                    </StyledTableCell>
                    <StyledTableCell>{coupon.used}</StyledTableCell>
                  </StyledTableRow>
                ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50]}
                colSpan={4}
                count={filteredCoupons.length}
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
            </TableRow>
          </TableFooter>
        </Table>
      </ContainerCoupon>
    </>
  );
}
