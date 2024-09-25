import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import { ContainerBestSellers, ContainerBestSeller, Container } from './styles';
import { Loading } from '../Loading';
import { InputSearch } from '../InputSearch';
import { ListVariation } from '../ListVariation';
import { InputSelect } from '../InputSelect';
import { ProductRegistration } from './ProductRegistration';
import { Button } from '../Button';
import { AuthDialog } from './AuthDialog';

export function Products() {
  const { allFullOrders, isLoadingAllOrders, store } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSales, setProductSales] = useState({});
  const [variations, setVariations] = useState({});
  const [filteredVariations, setFilteredVariations] = useState([]);
  const [numberProducts, setNumberProducts] = useState(5);
  const [showProductRegistration, setShowProductRegistration] = useState(false); // Estado para controle da visualização
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!isLoadingAllOrders) {
      const salesMap = {};
      const variationMap = {};

      allFullOrders.forEach(order => {
        if(order.products) {
          order.products.forEach(product => {
            const cleanedName = product.name.replace(/\(.*?\)/g, "").trim();
            let skuNumber = product.sku.split("-")[0]
            if(store === "outlet") {
              skuNumber = cleanedName.includes("Quadro") ? product.sku.split("-")[0].split("OT")[1] : product.sku.split("-")[0].split('OT')[1]
            }
            if (!salesMap[product.product_id]) {
              salesMap[product.product_id] = {
                id: product.product_id,
                skuNumber,
                name: cleanedName,
                image: product.image?.src,
                sales: 0,
                variantCount: {},
              };
            }
            salesMap[product.product_id].sales += 1;
  
            const variations = Array.isArray(product.variant_values) ? product.variant_values.join(", ") : "";
            if (variations) {
              if (!salesMap[product.product_id].variantCount[variations]) {
                salesMap[product.product_id].variantCount[variations] = 0;
              }
              salesMap[product.product_id].variantCount[variations] += 1;
            }
  
            if (variations) {
              if (!variationMap[variations]) {
                variationMap[variations] = { name: variations, sales: 0, id: variations };
              }
              variationMap[variations].sales += 1;
            }
          });
        }
      });

      const sortedProducts = Object.values(salesMap).sort((a, b) => b.sales - a.sales);
      setFilteredProducts(sortedProducts.slice(0, 10));
      setProductSales(salesMap);

      const sortedVariations = Object.values(variationMap).sort((a, b) => b.sales - a.sales);
      setFilteredVariations(sortedVariations);
      setVariations(variationMap);
    }
  }, [isLoadingAllOrders, allFullOrders]);

  useEffect(() => {
    if (searchQuery !== '') {
      const filtered = Object.values(productSales).filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.skuNumber?.includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered.sort((a, b) => b.sales - a.sales));

      const filteredVar = filtered.flatMap(product => 
        Object.entries(product.variantCount).map(([variant, sales]) => ({
          name: variant,
          sales,
          id: variant
        }))
      ).reduce((acc, curr) => {
        const existing = acc.find(v => v.name === curr.name);
        if (existing) {
          existing.sales += curr.sales;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []).sort((a, b) => b.sales - a.sales);

      setFilteredVariations(filteredVar);
    } else {
      setFilteredProducts(Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, numberProducts));
      setFilteredVariations(Object.values(variations).sort((a, b) => b.sales - a.sales));
    }
  }, [searchQuery, numberProducts, productSales, variations]);

  useEffect(() => {
    const auth = localStorage.getItem('authenticated');
    setAuthenticated(auth === 'true');
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleView = () => {
    if (authenticated) {
      setShowProductRegistration(!showProductRegistration);
    } else {
      setAuthDialogOpen(true);
    }
  };

  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
  };

  const handleAuthenticate = () => {
    setAuthenticated(true);
    setShowProductRegistration(true);
  };

  return (
    <Container>
      <div className="header-container">
        <InputSearch
          label="Buscar produto:"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Busque por nome ou SKU"
        />
      <Button onClick={toggleView} type ='button'>
          {showProductRegistration ? 'Voltar para Lista de Produtos' : 'Cadastrar Produto'}
        </Button>
      </div>
      <AuthDialog
        open={authDialogOpen}
        onClose={handleAuthDialogClose}
        onAuthenticate={handleAuthenticate}
      />
      {showProductRegistration ? (
        <ProductRegistration />
      ) : (
        <>
          <div className="header--number-products">
            <h1>Mais vendidos</h1>
            <InputSelect setNumberProducts={setNumberProducts} />
          </div>
          <ContainerBestSellers>
            <ContainerBestSeller>
              <header className="header">
                <h2 className="categorie">Produtos</h2>
                <h2 className="total-sales">Vendas</h2>
              </header>
              <div className="table">
                {isLoadingAllOrders ? (
                  <div className="loading">
                    <Loading color={"#1F1F1F"} />
                  </div>
                ) : (
                  filteredProducts.slice(0, numberProducts).map((product, productIndex) => (
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
                {filteredProducts.length === 0 && !isLoadingAllOrders && (
                  <div className="loading">Nenhum produto encontrado</div>
                )}
              </div>
            </ContainerBestSeller>
            <ContainerBestSeller className="variations">
              <header className="header">
                <h2 className="categorie">Variações</h2>
              </header>
              <div className="table">
                {isLoadingAllOrders ? (
                  <div className="loading">
                    <Loading color={"#1F1F1F"} />
                  </div>
                ) : (
                  filteredVariations.slice(0, numberProducts).map((variant, variantIndex) => (
                    <ListVariation
                      key={variant.id}
                      position={variantIndex + 1}
                      name={variant.name}
                      sales={variant.sales}
                    />
                  ))
                )}
                {filteredVariations.length === 0 && !isLoadingAllOrders && (
                  <div className="loading">Nenhuma variação encontrada</div>
                )}
              </div>
            </ContainerBestSeller>
          </ContainerBestSellers>
        </>
      )}
    </Container>
  );
}
