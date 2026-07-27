import React, { useState, useEffect, useMemo } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import {
  ContainerBestSellers,
  ContainerBestSeller,
  Container,
  ContainerSelect,
} from './styles';
import { InputSearch } from '../InputSearch';
import { ListVariation } from '../ListVariation';
import { InputSelect } from '../InputSelect';
import { ProductRegistration } from './ProductRegistration';
import { Button } from '../Button';
import { AuthDialog } from './AuthDialog';
import { formatCurrency } from '../../tools/tools';
import { Oval } from 'react-loader-spinner';
import { fetchProductSales } from '../../api/db';

export function Products() {
  // A loja vem do filtro global (OrdersContext). O período NÃO se aplica aqui:
  // a aba Produtos mostra o total histórico (all-time) de vendas por produto.
  const { store } = useOrders();

  // Vendas já vêm AGREGADAS do backend (/db/product-sales), reproduzindo a tela
  // legada: agrupadas por product_id, faturamento pelo preço histórico da linha,
  // variações por variant_values, contando todos os status.
  const [products, setProducts] = useState([]);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [numberProducts, setNumberProducts] = useState(5);
  const [sortType, setSortType] = useState('sales'); // 'sales' | 'revenue'
  const [showProductRegistration, setShowProductRegistration] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Busca as vendas por produto já agregadas no backend (all-time, por loja).
  // Não depende do período.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchProductSales(store)
      .then((data) => {
        if (!active) return;
        setProducts(data.products);
        setVariations(data.variations);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Erro ao carregar produtos');
        setProducts([]);
        setVariations([]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [store]);

  // Produtos filtrados por busca (nome/SKU) e ordenados por sortType.
  const filteredProducts = useMemo(() => {
    const sorter = (a, b) =>
      sortType === 'sales' ? b.sales - a.sales : b.revenue - a.revenue;
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.skuNumber?.toLowerCase().includes(query),
        )
      : products;
    return [...filtered].sort(sorter);
  }, [products, searchQuery, sortType]);

  // Variações exibidas: sem busca, todas; com busca, só as dos produtos filtrados.
  const filteredVariations = useMemo(() => {
    if (!searchQuery) return variations;
    const counts = {};
    filteredProducts.forEach((product) => {
      Object.entries(product.variantCount).forEach(([variant, sales]) => {
        counts[variant] = (counts[variant] || 0) + sales;
      });
    });
    return Object.entries(counts)
      .map(([name, sales]) => ({ id: name, name, sales }))
      .sort((a, b) => b.sales - a.sales);
  }, [searchQuery, filteredProducts, variations]);

  useEffect(() => {
    const auth = localStorage.getItem('authenticated');
    setAuthenticated(auth === 'true');
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortTypeChange = (event) => {
    setSortType(event.target.value);
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
        <Button onClick={toggleView} type="button">
          {showProductRegistration
            ? 'Voltar para Lista de Produtos'
            : 'Cadastrar Produto'}
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
            <h1>
              {sortType === 'sales' ? 'Mais Vendidos' : 'Maior Faturamento'}
            </h1>
            <InputSelect setNumberProducts={setNumberProducts} />
            <ContainerSelect>
              <select onChange={handleSortTypeChange} value={sortType}>
                <option value="sales">Mais Vendidos</option>
                <option value="revenue">Faturamento</option>
              </select>
            </ContainerSelect>
          </div>
          {error && (
            <div style={{ color: 'var(--uidanger-100, #d32f2f)', fontSize: 14 }}>
              Não foi possível carregar os produtos.
            </div>
          )}
          <ContainerBestSellers>
            <ContainerBestSeller>
              <header className="header">
                <h2 className="categorie">Produtos</h2>
                <h2 className="total-sales">
                  {sortType === 'sales' ? 'Vendas' : 'Faturamento'}
                </h2>
              </header>
              <div className="table">
                {loading ? (
                  <div className="loading">
                    <Oval
                      height={16}
                      width={16}
                      color="#1874cd"
                      visible={true}
                      ariaLabel="oval-loading"
                      strokeWidth={4}
                      strokeWidthSecondary={4}
                    />
                  </div>
                ) : (
                  filteredProducts
                    .slice(0, numberProducts)
                    .map((product, productIndex) => (
                      <ListProduct
                        key={product.id}
                        idProduct={product.id}
                        position={productIndex + 1}
                        skuNumber={product.skuNumber}
                        name={product.name}
                        sales={
                          sortType === 'sales'
                            ? product.sales
                            : formatCurrency(product.revenue)
                        }
                        urlImage={product.image}
                        variations={product.variations}
                        totalSales={product.revenue}
                      />
                    ))
                )}
                {filteredProducts.length === 0 && !loading && (
                  <div className="loading">Nenhum produto encontrado</div>
                )}
              </div>
            </ContainerBestSeller>
            <ContainerBestSeller className="variations">
              <header className="header">
                <h2 className="categorie">Variações</h2>
              </header>
              <div className="table">
                {loading ? (
                  <div className="loading">
                    <Oval
                      height={16}
                      width={16}
                      color="#1874cd"
                      visible={true}
                      ariaLabel="oval-loading"
                      strokeWidth={4}
                      strokeWidthSecondary={4}
                    />
                  </div>
                ) : (
                  filteredVariations
                    .slice(0, numberProducts)
                    .map((variant, variantIndex) => (
                      <ListVariation
                        key={variant.id}
                        position={variantIndex + 1}
                        name={variant.name}
                        sales={variant.sales}
                      />
                    ))
                )}
                {filteredVariations.length === 0 && !loading && (
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
