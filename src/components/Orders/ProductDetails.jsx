import React from 'react';
import { styled } from '@mui/material/styles';
import { formatCurrency } from '../../tools/tools.ts';
import { ContainerDetails, ProductImage } from './styles';
import { Table, Theme } from '@radix-ui/themes';

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

export function ProductDetails({ products, subtotal }) {
  console.log(subtotal);

  return (
    <Theme hasBackground={false} style={{ minHeight: '10%' }}>
      <ContainerDetails>
        <h3>Pedido</h3>
        <Table.Root variant="surface" layout={'auto'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Imagem</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>SKU</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                {products[0].name === 'Produto Loja Fisica' ||
                products[0].sku === 'produto-loja'
                  ? 'Quantidade de Clientes'
                  : 'Quantidade'}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
              {products[0].name === 'Produto Loja Fisica' ||
              products[0].sku === 'produto-loja' ? (
                <Table.ColumnHeaderCell>
                  Total(CLIENTES NOVOS)
                </Table.ColumnHeaderCell>
              ) : (
                ''
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {products.map((product, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <ProductImage src={product.image?.src} alt={product.name} />
                </Table.Cell>
                <Table.Cell>{formatProductName(product.name)}</Table.Cell>
                <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                  {product.sku}
                </Table.Cell>
                <Table.Cell>{product.quantity}</Table.Cell>
                <Table.Cell>
                  {product.name === 'Produto Loja Fisica' ||
                  product.sku === 'produto-loja'
                    ? formatCurrency(product.price)
                    : formatCurrency(product.price * product.quantity)}
                </Table.Cell>
                {products[0].name === 'Produto Loja Fisica' ||
                products[0].sku === 'produto-loja' ? (
                  <Table.Cell>{formatCurrency(subtotal)}</Table.Cell>
                ) : (
                  ''
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </ContainerDetails>
    </Theme>
  );
}
