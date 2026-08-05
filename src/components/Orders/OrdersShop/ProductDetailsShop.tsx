import React, { useEffect, useMemo, useState } from 'react';
import { Table } from '@radix-ui/themes';
import { RadixTheme } from '../../RadixTheme';
import { ContainerDetails, ProductImage } from '../styles';
import { formatCurrency } from '../../../tools/tools';
import { Loading } from '../../Loading';
import { resolveProducts } from '../../../hooks/productCache';
import { ProductDetailShop, ProductRow } from '../../../types';

interface ProductDetailsShopProps {
  // Array de SKUs (cod_categoria) vindo de orders_shop.products.
  skus: string[];
  // Só é passado em pedidos MANUAIS (loja física / chatbot): lá `products` guarda um único
  // SKU placeholder e a informação útil — a quantidade de clientes do dia e o valor da
  // venda — vive em orders_shop.products_detail. Nos demais pedidos fica undefined e o
  // componente segue agrupando os SKUs repetidos, como sempre fez.
  productsDetail?: ProductDetailShop[];
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

export function ProductDetailsShop({
  skus,
  productsDetail,
}: ProductDetailsShopProps) {
  // Pedido manual: uma linha por item de products_detail, com a quantidade REAL gravada
  // (nº de clientes do dia). Sem ele, o comportamento é o de sempre — agrupar SKUs repetidos.
  const isManual = Array.isArray(productsDetail) && productsDetail.length > 0;

  const grouped = useMemo(
    () =>
      isManual
        ? productsDetail!.map((item) => ({
            sku: item.sku,
            quantity: Number(item.quantity) || 0,
          }))
        : groupSkus(skus),
    [isManual, productsDetail, skus],
  );
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
    <RadixTheme hasBackground={false} style={{ minHeight: '10%' }}>
      <ContainerDetails>
        <h3>Pedido</h3>
        <Table.Root variant='surface' layout={'auto'}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Imagem</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>SKU</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Dimensão</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                {isManual ? 'Quantidade de Clientes' : 'Quantidade'}
              </Table.ColumnHeaderCell>
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
                const detail = isManual ? productsDetail![index] : undefined;
                // Em pedido manual o preço da linha é o valor da venda gravado no pedido.
                // O `categorias.preco` do placeholder PRODUTO-LOJA não serve: é reescrito a
                // cada novo pedido manual, então mostraria o valor de outra venda.
                const price = detail
                  ? Number(detail.price) || 0
                  : product
                    ? Number(product.preco) || 0
                    : 0;
                const dimension =
                  skuDimension(sku) || product?.dim_categoria || '—';
                const image = detail?.image || product?.img_categoria || null;
                return (
                  <Table.Row key={`${sku}-${index}`}>
                    <Table.Cell>
                      {image ? (
                        <ProductImage
                          src={image}
                          alt={product?.nome_categoria || sku}
                        />
                      ) : (
                        '—'
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {cleanName(
                        detail?.name ||
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
                    {/* Loja física: o preço JÁ é o total da venda do dia — multiplicar pela
                        quantidade de clientes inflaria o valor (mesma regra do legado). */}
                    <Table.Cell>
                      {formatCurrency(isManual ? price : price * quantity)}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </ContainerDetails>
    </RadixTheme>
  );
}
