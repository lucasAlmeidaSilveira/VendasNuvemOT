import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import { ContainerBestSellers, ContainerBestSeller, Container } from './styles';
import { Loading } from '../Loading';
import { Oval } from 'react-loader-spinner';
import { InputSelect } from '../InputSelect';
import { formatCurrency } from '../../tools/tools';

export function BestSellers() {
  const { orders, isLoading } = useOrders();
  const [products, setProducts] = useState({ quadros: [], espelhos: [] });
  const [numberProducts, setNumberProducts] = useState(5);
  const [totalSales, setTotalSales] = useState({ quadros: { count: 0, value: 0 }, espelhos: { count: 0, value: 0 } });

  console.log("orders", orders)
  useEffect(() => {
    const processProducts = (category) => {
      let totalCategoryCount = 0; // Contagem de vendas para a categoria
      let totalCategoryValue = 0; // Valor total em reais para a categoria
      const processedProducts = orders.reduce((acc, order) => {
        order.products.forEach((product) => {
          if (product.name.includes(category)) {
            const cleanedName = product.name.replace(/\(.*?\)/g, "").trim();
            const productId = product.product_id;
            const price = parseFloat(product.price); // Converte o preço do produto de string para número
            const existingProduct = acc.find(p => p.id === productId);
            if (existingProduct) {
              existingProduct.sales += 1;
            } else {
              acc.push({
                id: productId,
                skuNumber: product.sku.split("-")[0],
                name: cleanedName,
                image: product.image.src,
                sales: 1,
                total: price
              });
            }
            totalCategoryCount += 1;
            totalCategoryValue += price; // Soma o valor do produto ao total da categoria
          }
        });
        return acc;
      }, []).sort((a, b) => b.sales - a.sales);

      // Retornamos os produtos filtrados pela quantidade definida em numberProducts para exibição
      return { 
        products: processedProducts.slice(0, numberProducts), 
        count: totalCategoryCount, 
        value: totalCategoryValue 
      };
    };

    const quadros = processProducts("Quadro");
    const espelhos = processProducts("Espelho");

    setProducts({
      quadros: quadros.products,
      espelhos: espelhos.products,
    });

    setTotalSales({
      quadros: { count: quadros.count, value: quadros.value },
      espelhos: { count: espelhos.count, value: espelhos.value },
    });
    
  }, [orders, numberProducts]);

  return (
    <Container>
      <div className="header-container">
        <h1>Mais vendidos</h1>
        <InputSelect setNumberProducts={setNumberProducts} />
      </div>
      <ContainerBestSellers>
        {['quadros', 'espelhos'].map((category, index) => (
          <ContainerBestSeller key={index}>
            <header className="header">
              <h2 className="categorie">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              {isLoading ? (
                <Oval
                  height={16}
                  width={16}
                  color="#FCFAFB"
                  visible={true}
                  ariaLabel='oval-loading'
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
              ) : (
                <h2 className="sales-cetegorie">
                  {totalSales[category].count} vendas
                  <span className='total-sales'>{formatCurrency(totalSales[category].value)}</span>
                </h2>
              )}
            </header>
            <div className="table">
              {isLoading ? (
                <div className="loading">
                  <Loading color={"#1F1F1F"} />
                </div>
              ) : (
                products[category].map((product, productIndex) => (
                  <ListProduct key={product.id} position={productIndex + 1} skuNumber={product.skuNumber} name={product.name} sales={product.sales} urlImage={product.image} />
                ))
              )}
            </div>
          </ContainerBestSeller>
        ))}
      </ContainerBestSellers>
    </Container>
  );
}
