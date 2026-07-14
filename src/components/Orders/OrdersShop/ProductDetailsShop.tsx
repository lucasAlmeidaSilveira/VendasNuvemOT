import React, { useEffect, useMemo, useState } from 'react';
import { Table, Theme } from '@radix-ui/themes';
import { ContainerDetails, ProductImage } from '../styles';
import { formatCurrency } from '../../../tools/tools';
import { Loading } from '../../Loading';
import { resolveProducts } from '../../../hooks/productCache';
import { ProductRow } from '../../../types';

interface ProductDetailsShopProps {
  // Array de SKUs (cod_categoria) vindo de orders_shop.products.
  skus: string[];
}

// Código-base legível do SKU composto (ex.: "OT|285-...-90X60-1" -> "285").
const baseCode = (sku: string) => {
  const afterPipe = String(sku).split('|')[1] || String(sku);
  return afterPipe.split('-')[0] || String(sku);
};
// Dimensão vendida embutida no SKU (ex.: "...-90X60-1" -> "90X60").
const skuDimension = (sku: string) => {
  const match = String(sku).match(/(\d+X\d+)/i);
  return match ? match[1].toUpperCase() : '';
};
const cleanName = (value: string) =>
  String(value || '').replace(/\(.*?\)/g, '').trim();

// Agrupa SKUs repetidos em { sku, quantity }, preservando a ordem.
function groupSkus(skus: string[]): { sku: string; quantity: number }[] {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const sku of skus) {
    if (!counts.has(sku)) order.push(sku);
    counts.set(sku, (counts.get(sku) ?? 0) + 1);
  }
  return order.map((sku) => ({ sku, quantity: counts.get(sku) ?? 1 }));
}

export function ProductDetailsShop({ skus }: ProductDetailsShopProps) {
  const grouped = useMemo(() => groupSkus(skus), [skus]);
  const [productMap, setProductMap] = useState<Map<string, ProductRow | null>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const key = grouped.map((g) => g.sku).join('|');

  useEffect(() => {
    let active = true;
    setLoading(true);
    resolveProducts(grouped.map((g) => g.sku)).then((map) => {
      if (!active) return;
      setProductMap(map);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <Theme hasBackground={false} style={{ minHeight: '10%' }}>
      <ContainerDetails>
        <h3>Pedido</h3>
        <Table.Root variant='surface' layout={'auto'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Imagem</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>SKU</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Dimensão</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Quantidade</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Preço</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Loading />
                </Table.Cell>
              </Table.Row>
            ) : (
              grouped.map(({ sku, quantity }, index) => {
                const product = productMap.get(sku);
                const price = product ? Number(product.preco) || 0 : 0;
                const dimension =
                  skuDimension(sku) || product?.dim_categoria || '—';
                return (
                  <Table.Row key={`${sku}-${index}`}>
                    <Table.Cell>
                      {product?.img_categoria ? (
                        <ProductImage
                          src={product.img_categoria}
                          alt={product?.nome_categoria || sku}
                        />
                      ) : (
                        '—'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {cleanName(
                        product?.desc_categoria ||
                          product?.nome_categoria ||
                          sku,
                      )}
                    </Table.Cell>
                    <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                      {baseCode(sku)}
                    </Table.Cell>
                    <Table.Cell>{dimension}</Table.Cell>
                    <Table.Cell>{quantity}</Table.Cell>
                    <Table.Cell>{formatCurrency(price)}</Table.Cell>
                    <Table.Cell>{formatCurrency(price * quantity)}</Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </ContainerDetails>
    </Theme>
  );
}
