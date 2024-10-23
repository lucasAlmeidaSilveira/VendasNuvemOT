import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import { ContainerBestSellers, ContainerBestSeller, Container } from './styles';
import { Loading } from '../Loading';
import { Oval } from 'react-loader-spinner';
import { InputSelect } from '../InputSelect';
import { formatCurrency } from '../../tools/tools';
import { filterOrders } from '../../tools/filterOrders';
import { ListVariation } from '../ListVariation';
import { CategorySelect } from '../CategorySelect';

export function BestSellers() {
  const { allOrders, isLoading, date, store } = useOrders();
  const [products, setProducts] = useState({ quadros: [], espelhos: [], variations: [] });
  const [numberProducts, setNumberProducts] = useState(5);
  const [totalSales, setTotalSales] = useState({ quadros: { count: 0, value: 0 }, espelhos: { count: 0, value: 0 } });
  const [percentual, setPercentual] = useState({ vendas: { quadros: 0, espelhos: 0 }, valor: { quadros: 0, espelhos: 0 } });
  const [selectedCategory, setSelectedCategory] = useState('Quadro Decorativo'); // Estado para a categoria selecionada
  const { ordersToday } = filterOrders(allOrders, date);

  useEffect(() => {
    const totals = { vendas: 0, valor: 0 }; // Para calcular os totais gerais

    const processProducts = (category) => {
      let totalCategoryValue = 0;
      let totalCategorySales = 0;
      const processedProducts = ordersToday.reduce((acc, order) => {
        order.products.forEach((product) => {
          if (product.name.includes(category)) {
            const cleanedName = product.name.replace(/\(.*?\)/g, "").trim();
            const productId = product.product_id;
            const price = parseFloat(product.price);
            const existingProduct = acc.find(p => p.id === productId);
            let skuNumber = cleanedName.includes("Quadro") ? product.sku.split("-")[0].split("|")[1] : product.sku.split("-")[0].split('OT')[1]

            // Contar a frequência das variações
            const variations = Array.isArray(product.variant_values) ? product.variant_values.join(", ") : "";
            let variantCount = {};
            if (existingProduct) {
              existingProduct.sales += 1;
              if (variations) {
                variantCount = existingProduct.variantCount;
                variantCount[variations] = (variantCount[variations] || 0) + 1;
              }
            } else {

              acc.push({
                id: productId,
                skuNumber,
                urlProduct: product.landing_url,
                name: cleanedName,
                image: product.image.src,
                sales: 1,
                total: price,
                variantCount: variations ? { [variations]: 1 } : {}
              });
            }

            totalCategorySales += 1;
            totalCategoryValue += price;
            totals.vendas += 1;
            totals.valor += price;
          }
        });
        return acc;
      }, []).sort((a, b) => b.sales - a.sales);

      // Selecionar a variação mais vendida
      processedProducts.forEach(product => {
        const variantEntries = Object.entries(product.variantCount);
        if (variantEntries.length > 0) {
          const mostSoldVariant = variantEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max, variantEntries[0]);
          product.variations = mostSoldVariant[0];
        } else {
          product.variations = category === 'Espelho' ? 'Slim' : '';
        }
      });

      return { products: processedProducts, totalSales: totalCategorySales, totalValue: totalCategoryValue };
    };

    const processVariations = (category) => {
      const variationCounts = {};

      ordersToday.forEach(order => {
        order.products.forEach(product => {
          if (product.name.includes(category)) {
            const variation = product.variant_values.length > 0 ? product.variant_values.join(", ") : 'Slim';
            if (variationCounts[variation]) {
              variationCounts[variation] += 1;
            } else {
              variationCounts[variation] = 1;
            }
          }
        });
      });

      const sortedVariations = Object.entries(variationCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([variation, count]) => ({
          name: variation,
          sales: count,
          id: variation
        }));

      return sortedVariations;
    };

    const quadros = processProducts("Quadro");
    const espelhos = processProducts("Espelho");
    const variations = processVariations(selectedCategory); // Usar a categoria selecionada

    setProducts({
      quadros: quadros.products,
      espelhos: espelhos.products,
      variations: variations,
    });

    setTotalSales({
      quadros: { count: quadros.totalSales, value: quadros.totalValue },
      espelhos: { count: espelhos.totalSales, value: espelhos.totalValue },
    });

    // Calcula os percentuais
    setPercentual({
      vendas: {
        quadros: (quadros.totalSales / totals.vendas) * 100,
        espelhos: (espelhos.totalSales / totals.vendas) * 100,
      },
      valor: {
        quadros: (quadros.totalValue / totals.valor) * 100,
        espelhos: (espelhos.totalValue / totals.valor) * 100,
      },
    });

  }, [isLoading, date, numberProducts, selectedCategory, allOrders]); // Adicionar selectedCategory como dependência

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const categoryOptions = [
    { value: 'Quadro Decorativo', label: 'Quadro' },
    { value: 'Espelho', label: 'Espelho' },
  ];

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
                  color="#1874cd"
                  visible={true}
                  ariaLabel='oval-loading'
                  strokeWidth={4}
                  strokeWidthSecondary={4}
                />
              ) : (
                <h2 className="sales-cetegorie">
                  {products[category].reduce((acc, curr) => acc + curr.sales, 0)} unidades
                  <span className='total-sales'>{formatCurrency(totalSales[category].value)} | {percentual.valor[category].toFixed(2)}%</span>
                </h2>
              )}
            </header>
            <div className="table">
              {isLoading ? (
                <div className="loading">
                  <Loading />
                </div>
              ) : (
                products[category].slice(0, numberProducts).map((product, productIndex) => (
                  <ListProduct
                    key={product.id}
                    idProduct={product.id}
                    position={productIndex + 1}
                    skuNumber={product.skuNumber}
                    name={product.name}
                    sales={product.sales}
                    urlImage={product.image}
                    variations={product.variations}
                  />
                ))
              )}
              {products[category].length === 0 && !isLoading && (
                <div className="loading">Nenhum produto encontrado</div>
              )}
            </div>
          </ContainerBestSeller>
        ))}
        <ContainerBestSeller className="variations">
          <header className="header">
            <h2 className="categorie">Variações</h2>
            <CategorySelect
              options={categoryOptions}
              selectedCategory={selectedCategory}
              handleCategoryChange={handleCategoryChange}
            />
          </header>
          <div className="table">
            {isLoading ? (
              <div className="loading">
                <Loading />
              </div>
            ) : (
              products.variations.slice(0, numberProducts).map((variant, variantIndex) => (
                <ListVariation
                  key={variant.id}
                  position={variantIndex + 1}
                  name={variant.name}
                  sales={variant.sales}
                />
              ))
            )}
            {products.variations.length === 0 && !isLoading && (
              <div className="loading">Nenhuma variação encontrado</div>
            )}
          </div>
        </ContainerBestSeller>
      </ContainerBestSellers>
    </Container>
  );
}
