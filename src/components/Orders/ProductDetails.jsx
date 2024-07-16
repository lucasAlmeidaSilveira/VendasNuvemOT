import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatCurrency } from '../../tools/tools';

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'Poppins',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'left',
  fontSize: 14,
  fontFamily: 'Poppins',
  padding: '8px 20px',
  whiteSpace: 'pre-wrap',
}));

const ProductImage = styled('img')({
  width: 48,
  height: 48,
  objectFit: 'cover',
  borderRadius: 8,
});

const formatProductName = (name) => {
  const regex = /\((.*?)\)/;
  const match = name.match(regex);
  if (match) {
    const mainName = name.replace(regex, '').trim();
    const parenthesesContent = match[0];
    return (
      <>
        {mainName}
        <br />
        <span style={{ fontWeight: '600' }}>{parenthesesContent}</span>
      </>
    );
  }
  return name;
};

export function ProductDetails({ products }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="products table">
        <TableHead>
          <TableRow>
            <StyledTableHeadCell>Imagem</StyledTableHeadCell>
            <StyledTableHeadCell>Nome</StyledTableHeadCell>
            <StyledTableHeadCell>SKU</StyledTableHeadCell>
            <StyledTableHeadCell>Quantidade</StyledTableHeadCell>
            <StyledTableHeadCell>Total</StyledTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <StyledTableCell>
                <ProductImage src={product.image.src} alt={product.name} />
              </StyledTableCell>
              <StyledTableCell style={{width: '100%'}}>{formatProductName(product.name)}</StyledTableCell>
              <StyledTableCell style={{whiteSpace: 'nowrap'}}>{product.sku}</StyledTableCell>
              <StyledTableCell>{product.quantity}</StyledTableCell>
              <StyledTableCell>{formatCurrency(product.price * product.quantity)}</StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
