import React, { useState, useEffect, useMemo } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import { ContainerBestSellers, ContainerBestSeller, Container } from './styles';
import { Loading } from '../Loading';
import { Oval } from 'react-loader-spinner';
import { InputSelect } from '../InputSelect';
import { formatCurrency, formatDate } from '../../tools/tools';
import { ListVariation } from '../ListVariation';
import { CategorySelect } from '../CategorySelect';
import { fetchTable } from '../../api/db';
import { resolveProducts } from '../../hooks/productCache';
import { DatabaseTable } from '../../types';
import {
  CATEGORY_KEYWORDS,
  PLACEHOLDER,
  baseCode,
  skuDimension,
  cleanName,
} from '../../tools/skus';

export function BestSellers() {
  // Período e loja vêm dos filtros globais (OrdersContext).
  const { date, store } = useOrders();

  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState(() => new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numberProducts, setNumberProducts] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('Quadro Decorativo');

  // Busca pedidos PAGOS do período/loja via orders_shop e resolve os SKUs no
  // catálogo (/db/product/:sku, com cache). Usa o service direto (fora do
  // DbContext single-table) para NÃO conflitar com o daily_sales do Dashboard.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const startDate = formatDate(date[0]);
    const endDate = formatDate(date[1]);

    fetchTable(DatabaseTable.ORDERS_SHOP, { startDate, endDate, store })
      .then(async (rows) => {
        // Pagos, excluindo método "other" (parcerias) — igual ao filterOrders legado.
        const paid = rows.filter(
          (order) =>
            order.payment_status === 'paid' && order.payment_method !== 'other',
        );
        const skus = paid.flatMap((order) =>
          Array.isArray(order.products) ? order.products : [],
        );
        const resolved = await resolveProducts(skus);
        if (!active) return;
        setOrders(paid);
        setProductMap(resolved);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Erro ao carregar mais vendidos');
        setOrders([]);
        setProductMap(new Map());
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [date, store]);

  // Agrega por categoria: unidades vendidas (frequência de SKU) e faturamento
  // (frequência × preço do catálogo). Percentuais = participação da categoria.
  const { products, totalSales, percentual } = useMemo(() => {
    const cats = {
      quadros: { map: {}, count: 0, value: 0 },
      espelhos: { map: {}, count: 0, value: 0 },
      artesanais: { map: {}, count: 0, value: 0 },
    };

    orders.forEach((order) => {
      const skus = Array.isArray(order.products) ? order.products : [];
      skus.forEach((sku) => {
        const prod = productMap.get(sku);
        const classifySource = prod
          ? `${prod.nome_categoria || ''} ${prod.desc_categoria || ''}`.toLowerCase()
          : String(sku).toLowerCase();
        // Pula placeholder de Loja Física, como no legado.
        if (classifySource.includes(PLACEHOLDER)) return;

        const price = prod ? Number(prod.preco) || 0 : 0;
        const image = prod ? prod.img_categoria : undefined;
        const displayName = cleanName(
          prod ? prod.desc_categoria || prod.nome_categoria || sku : sku,
        );
        const key = baseCode(sku); // agrupa variantes do mesmo produto
        const dimension = skuDimension(sku) || (prod && prod.dim_categoria) || '';

        Object.entries(CATEGORY_KEYWORDS).forEach(([catKey, keyword]) => {
          if (!classifySource.includes(keyword)) return;
          const cat = cats[catKey];
          if (!cat.map[key]) {
            cat.map[key] = {
              id: key,
              skuNumber: key,
              name: displayName,
              image,
              sales: 0,
              totalSales: 0,
              variantCount: {},
            };
          }
          const entry = cat.map[key];
          entry.sales += 1;
          entry.totalSales += price;
          if (!entry.image && image) entry.image = image;
          if (dimension) {
            entry.variantCount[dimension] =
              (entry.variantCount[dimension] || 0) + 1;
          }
          cat.count += 1;
          cat.value += price;
        });
      });
    });

    // Variação mais vendida por produto (dimensão), como no legado.
    Object.values(cats).forEach((cat) =>
      Object.values(cat.map).forEach((product) => {
        const top = Object.entries(product.variantCount).sort(
          (a, b) => b[1] - a[1],
        )[0];
        product.variations = top ? top[0] : '';
      }),
    );

    const totalCount =
      cats.quadros.count + cats.espelhos.count + cats.artesanais.count;
    const totalValue =
      cats.quadros.value + cats.espelhos.value + cats.artesanais.value;
    const pct = (part, total) => (total ? (part / total) * 100 : 0);
    const toSorted = (cat) =>
      Object.values(cat.map).sort((a, b) => b.sales - a.sales);

    return {
      products: {
        quadros: toSorted(cats.quadros),
        espelhos: toSorted(cats.espelhos),
        artesanais: toSorted(cats.artesanais),
      },
      totalSales: {
        quadros: { count: cats.quadros.count, value: cats.quadros.value },
        espelhos: { count: cats.espelhos.count, value: cats.espelhos.value },
        artesanais: { count: cats.artesanais.count, value: cats.artesanais.value },
      },
      percentual: {
        valor: {
          quadros: pct(cats.quadros.value, totalValue),
          espelhos: pct(cats.espelhos.value, totalValue),
          artesanais: pct(cats.artesanais.value, totalValue),
        },
        vendas: {
          quadros: pct(cats.quadros.count, totalCount),
          espelhos: pct(cats.espelhos.count, totalCount),
          artesanais: pct(cats.artesanais.count, totalCount),
        },
      },
    };
  }, [orders, productMap]);

  // Variações (simplificado): orders_shop não tem variant_values por linha, então
  // ranqueamos por dimensão/tipo do catálogo dentro da categoria selecionada.
  const variations = useMemo(() => {
    const keyword = selectedCategory.toLowerCase().includes('espelho')
      ? 'espelho'
      : 'quadro';
    const counts = {};

    orders.forEach((order) => {
      const skus = Array.isArray(order.products) ? order.products : [];
      skus.forEach((sku) => {
        const prod = productMap.get(sku);
        const classifySource = prod
          ? `${prod.nome_categoria || ''} ${prod.desc_categoria || ''}`.toLowerCase()
          : '';
        if (classifySource.includes(PLACEHOLDER)) return;
        if (!classifySource.includes(keyword)) return;
        const dimension =
          skuDimension(sku) || (prod && prod.dim_categoria) || 'Outros';
        counts[dimension] = (counts[dimension] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, sales]) => ({ name, sales, id: name }));
  }, [orders, productMap, selectedCategory]);

  const handleCategoryChange = (event) => setSelectedCategory(event.target.value);

  const categoryOptions = [
    { value: 'Quadro Decorativo', label: 'Quadro' },
    { value: 'Espelho', label: 'Espelho' },
  ];

  // Dados unificados consumidos pelo render (categorias + variações)
  const view = { ...products, variations };

  return (
    <Container>
      <div className="header-container">
        <h1>Mais vendidos</h1>
        <InputSelect setNumberProducts={setNumberProducts} />
      </div>
      {error && (
        <div style={{ color: 'var(--uidanger-100, #d32f2f)', fontSize: 14 }}>
          Não foi possível carregar os mais vendidos.
        </div>
      )}
      <ContainerBestSellers>
        {['quadros', 'artesanais', 'espelhos'].map((category, index) =>
          category === 'artesanais' && store !== 'artepropria' ? null : (
            <ContainerBestSeller key={index}>
              <header className="header">
                <h2 className="categorie">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h2>
                {loading ? (
                  <Oval
                    height={16}
                    width={16}
                    color="#1874cd"
                    visible={true}
                    ariaLabel="oval-loading"
                    strokeWidth={4}
                    strokeWidthSecondary={4}
                  />
                ) : (
                  <h2 className="sales-cetegorie">
                    {view[category].reduce((acc, curr) => acc + curr.sales, 0)}{' '}
                    unidades
                    <span className="total-sales">
                      {formatCurrency(totalSales[category].value)} |{' '}
                      {percentual.valor[category] === undefined
                        ? '0'
                        : percentual.valor[category].toFixed(2)}
                      %
                    </span>
                  </h2>
                )}
              </header>
              <div className="table">
                {loading ? (
                  <div className="loading">
                    <Loading />
                  </div>
                ) : (
                  view[category]
                    .slice(0, numberProducts)
                    .map((product, productIndex) => (
                      <ListProduct
                        key={product.id}
                        idProduct={product.id}
                        position={productIndex + 1}
                        skuNumber={product.skuNumber}
                        name={product.name}
                        sales={product.sales}
                        urlImage={product.image}
                        variations={product.variations}
                        totalSales={product.totalSales}
                      />
                    ))
                )}
                {view[category].length === 0 && !loading && (
                  <div className="loading">Nenhum produto encontrado</div>
                )}
              </div>
            </ContainerBestSeller>
          ),
        )}
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
            {loading ? (
              <div className="loading">
                <Loading />
              </div>
            ) : (
              view.variations
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
            {view.variations.length === 0 && !loading && (
              <div className="loading">Nenhuma variação encontrado</div>
            )}
          </div>
        </ContainerBestSeller>
      </ContainerBestSellers>
    </Container>
  );
}
