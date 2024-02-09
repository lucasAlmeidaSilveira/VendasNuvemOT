import React from 'react';
import { ContainerCoupon } from './styles';
import { useCoupons } from '../../context/CouponsContext';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'var(--geralblack-100)',
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "Poppins"
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 16,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export function Coupons(){
  const { coupons } = useCoupons()

  const sortedCoupons = Object.values(coupons).sort((a, b) => b.used - a.used)

  console.log("cupons", coupons)
  return (
    <ContainerCoupon component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Código</StyledTableCell>
            <StyledTableCell>Valor</StyledTableCell>
            <StyledTableCell>Usado</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCoupons.map((coupon) => (
            <StyledTableRow 
              key={coupon.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <StyledTableCell component="th" scope="row">
                {coupon.code}
              </StyledTableCell>
              {coupon.type === 'percentage'
                ? <StyledTableCell>{`${parseInt(coupon.value)}%`}</StyledTableCell>
                : <StyledTableCell>{`R$ ${parseFloat(coupon.value).toFixed(2)}`}</StyledTableCell>
              }
              <StyledTableCell>{coupon.used}</StyledTableCell>
            </StyledTableRow >
          ))}
        </TableBody>
      </Table>
    </ContainerCoupon>
  );
}