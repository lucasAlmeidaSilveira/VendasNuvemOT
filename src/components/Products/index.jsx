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
import { resolveProducts } from '../../hooks/productCache';
import { PLACEHOLDER, baseCode, skuDimension, cleanName } from '../../tools/skus';

// Agrega vendas históricas (all-time) em produtos e variações. O backend
// (/db/product-sales) já entrega o total de unidades por SKU dos pedidos pagos;
// nome/preço/imagem/dimensão vêm do catálogo (productMap). Replica o resultado
// da tela legada (que agrupava por product_id) agrupando pelo código-base do
// SKU — variantes do mesmo produto compartilham esse código.
function aggregateProducts(skuCounts, productMap) {
  const salesMap = {}; // baseCode -> { id, skuNumber, name, image, sales, revenue, variantCount }
  const variationMap = {}; // dimensão -> { id, name, sales }

  skuCounts.forEach(({ sku, units }) => {
    const prod = productMap.get(sku);
    const classifySource = prod
      ? `${prod.nome_categoria || ''} ${prod.desc_categoria || ''}`.toLowerCase()
      : String(sku).toLowerCase();
    // Pula placeholder de Loja Física, como no legado (nome contém "produto").
    if (classifySource.includes(PLACEHOLDER)) return;

    const key = baseCode(sku); // agrupa variantes do mesmo produto
    const price = prod ? Number(prod.preco) || 0 : 0;
    const image = prod ? prod.img_categoria : undefined;
    const name = cleanName(
      prod ? prod.desc_categoria || prod.nome_categoria || sku : sku,
    );
    const dimension = skuDimension(sku) || (prod && prod.dim_categoria) || '';

    if (!salesMap[key]) {
      salesMap[key] = {
        id: key,
        skuNumber: key,
        name,
        image,
        sales: 0,
        revenue: 0,
        variantCount: {},
      };
    }
    const entry = salesMap[key];
    entry.sales += units;
    entry.revenue += price * units; // faturamento = unidades × preço do catálogo
    if (!entry.image && image) entry.image = image;

    if (dimension) {
      entry.variantCount[dimension] =
        (entry.variantCount[dimension] || 0) + units;
      if (!variationMap[dimension]) {
        variationMap[dimension] = { id: dimension, name: dimension, sales: 0 };
      }
      variationMap[dimension].sales += units;
    }
  });

  // Variação (dimensão) mais vendida por produto, como no legado.
  Object.values(salesMap).forEach((product) => {
    const top = Object.entries(product.variantCount).sort(
      (a, b) => b[1] - a[1],
    )[0];
    product.variations = top ? top[0] : '';
  });

  return { salesMap, variationMap };
}

export function Products() {
  // A loja vem do filtro global (OrdersContext). O período NÃO se aplica aqui:
  // a aba Produtos mostra o total histórico (all-time) de vendas por produto.
  const { store } = useOrders();

  const [skuCounts, setSkuCounts] = useState([]);
  const [productMap, setProductMap] = useState(() => new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [numberProducts, setNumberProducts] = useState(5);
  const [sortType, setSortType] = useState('sales'); // 'sales' | 'revenue'
  const [showProductRegistration, setShowProductRegistration] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Busca o total histórico de unidades por SKU (all-time, por loja) e resolve
  // os SKUs no catálogo (/db/product/:sku, com cache). Não depende do período.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchProductSales(store)
      .then(async (counts) => {
        const resolved = await resolveProducts(counts.map((c) => c.sku));
        if (!active) return;
        setSkuCounts(counts);
        setProductMap(resolved);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Erro ao carregar produtos');
        setSkuCounts([]);
        setProductMap(new Map());
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [store]);

  // Agregação (produtos + variações) derivada das vendas históricas + catálogo.
  const { productSales, variations } = useMemo(() => {
    const { salesMap, variationMap } = aggregateProducts(skuCounts, productMap);
    return {
      productSales: salesMap,
      variations: Object.values(variationMap).sort((a, b) => b.sales - a.sales),
    };
  }, [skuCounts, productMap]);

  // Produtos filtrados por busca (nome/SKU) e ordenados por sortType.
  const filteredProducts = useMemo(() => {
    const sorter = (a, b) =>
      sortType === 'sales' ? b.sales - a.sales : b.revenue - a.revenue;
    const all = Object.values(productSales);
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? all.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.skuNumber?.toLowerCase().includes(query),
        )
      : all;
    return [...filtered].sort(sorter);
  }, [productSales, searchQuery, sortType]);

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
