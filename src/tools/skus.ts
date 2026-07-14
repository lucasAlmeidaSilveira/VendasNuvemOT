// =====================================================================
// Utilitários de SKU compartilhados entre as telas que agregam vendas a
// partir de `orders_shop` (que traz apenas SKUs por pedido) + catálogo
// (`/db/product/:sku`). Centralizados aqui para BestSellers e Products
// usarem exatamente as mesmas regras de parsing/classificação.
// =====================================================================

// Classificação por palavra-chave (mesma lógica da tela legada, agora sobre
// o nome/descrição vindos do catálogo). Um "Quadro Artesanal" continua
// aparecendo tanto em "quadros" quanto em "artesanais", como antes.
export const CATEGORY_KEYWORDS: Record<string, string> = {
  quadros: 'quadro',
  espelhos: 'espelho',
  artesanais: 'artesan',
};

// Placeholder de Loja Física a pular (mesma regra do legado: nome contém "produto").
export const PLACEHOLDER = 'produto';

// O SKU do orders_shop é composto, ex.: "OT|285-1-000+384-1-1-0-1-90X60-1".
// - Código-base do produto = trecho entre "|" e o 1º "-" (ex.: "285", "OTE9").
//   Variantes (dimensões) do mesmo produto compartilham esse código, então
//   agrupamos por ele para replicar o agrupamento por product_id do legado.
export const baseCode = (sku: string): string => {
  const afterPipe = String(sku).split('|')[1] || String(sku);
  return afterPipe.split('-')[0] || String(sku);
};

// Dimensão efetivamente vendida, embutida no SKU (ex.: "...-90X60-1" -> "90X60").
export const skuDimension = (sku: string): string => {
  const match = String(sku).match(/(\d+X\d+)/i);
  return match ? match[1].toUpperCase() : '';
};

// Remove sufixos entre parênteses do nome (ex.: "Espelho Pílula (80x50, Preto)").
export const cleanName = (value: unknown): string =>
  String(value || '')
    .replace(/\(.*?\)/g, '')
    .trim();
