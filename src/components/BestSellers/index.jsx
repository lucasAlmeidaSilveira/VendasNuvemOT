import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import { ContainerBestSellers, ContainerBestSeller, Container } from './styles';
import { Loading } from '../Loading';
import { Oval } from 'react-loader-spinner';
import { InputSelect } from '../InputSelect';

export function BestSellers() {
  const { orders, isLoading } = useOrders();
  const [quadrosWithVariations, setQuadrosWithVariations] = useState([]);
  const [espelhosProducts, setEspelhosProducts] = useState([]);
  const [numberProducts, setNumberProducts] = useState(5);

  useEffect(() => {
    let quadros = {};
    let espelhos = {};

    orders.forEach(order => {
      order.products.forEach(product => {
        const productData = {
          id: product.id,
          name: product.name.replace(/\(.*?\)/g, '').trim(),
          image: product.image.src,
          sales: 1,
        };

        if (product.name.includes('Quadro')) {
          const quadroId = product.product_id;
          quadros[quadroId] = quadros[quadroId] || {
            ...productData,
            totalSales: 0,
            variations: {},
          };
          quadros[quadroId].totalSales += 1;

          product.variant_values.forEach(variation => {
            let variantValues = Array.isArray(product.variant_values)
              ? product.variant_values
              : [product.variant_values];
            const variationKey = variantValues.join(', ');
            quadros[quadroId].variations[variationKey] =
              (quadros[quadroId].variations[variationKey] || 0) + 1;
          });
        } else if (product.name.includes('Espelho')) {
          espelhos[product.product_id] = espelhos[product.product_id]
            ? {
                ...espelhos[product.product_id],
                sales: espelhos[product.product_id].sales + 1,
              }
            : productData;
        }
      });
    });

    const sortedQuadros = Object.values(quadros)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, numberProducts)
      .map(quadro => ({
        ...quadro,
        variations: Object.entries(quadro.variations)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2), // Pegar apenas as duas variações mais vendidas
      }));

    const sortedEspelhos = Object.values(espelhos)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, numberProducts);

    setQuadrosWithVariations(sortedQuadros);
    setEspelhosProducts(sortedEspelhos);
  }, [orders, numberProducts]);

  return (
    <Container>
      <div className='header-container'>
        <h1>Mais Vendidos</h1>
        <InputSelect setNumberProducts={setNumberProducts} />
      </div>
      {isLoading ? (
        <Oval color='#1F1F1F' height={50} width={50} />
      ) : (
        <ContainerBestSellers>
          <ContainerBestSeller>
            <header className='header'>
              <h2>Quadros</h2>
            </header>
            <div className='table'>
              {quadrosWithVariations.map((quadro, index) => (
                <ListProduct
                  key={index}
                  position={index + 1}
                  name={quadro.name}
                  variations={quadro.variations}
                  sales={quadro.totalSales}
                  urlImage={quadro.image}
                />
              ))}
            </div>
          </ContainerBestSeller>
          <ContainerBestSeller>
            <header className='header'>
              <h2>Espelhos</h2>
            </header>
            <div className='table'>
              {espelhosProducts.map((espelho, index) => (
                <ListProduct
                  key={espelho.id}
                  position={index + 1}
                  name={espelho.name}
                  sales={espelho.sales}
                  urlImage={espelho.image}
                />
              ))}
            </div>
          </ContainerBestSeller>
        </ContainerBestSellers>
      )}
    </Container>
  );
}
