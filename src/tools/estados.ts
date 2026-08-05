// =====================================================================
// Normalização de UF brasileira.
//
// `orders_shop` não guarda estado: quem guarda é `clientes.uf_cli`, coluna
// com TRÊS produtores no backend e três formatos distintos —
//   Nuvemshop (dataBaseQueryList.js:324) grava por extenso  -> "São Paulo"
//   Tiny      (dataBaseQueryList.js:518) grava a sigla      -> "SP"
//   manual    (dataBaseQueryList.js:131) não grava nada     -> NULL
// Sem normalizar, "SP" e "São Paulo" viram DUAS barras no gráfico de vendas
// por estado, dividindo a contagem. A grafia canônica aqui é a mesma que o
// legado exibia (nome por extenso, acentuado), que também é a esperada pelo
// mapa `regions` do componente Chart.
// =====================================================================

export const UF_PARA_ESTADO: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

export const ESTADOS_BR: string[] = Object.values(UF_PARA_ESTADO);

// Rótulo que o próprio dump legado (`pedidos_<loja>.billing_province`) usa
// quando o pedido não tem estado.
export const ESTADO_NAO_INFORMADO = 'Não informado';

const semAcento = (valor: string): string =>
  valor.normalize('NFD').replace(/\p{Diacritic}/gu, '');

// Índice "sem acento + minúsculo" -> grafia canônica. É o que corrige as
// grafias erradas que existem em produção, como "Rorâima" -> "Roraima".
const PORNOME = new Map(
  ESTADOS_BR.map((nome) => [semAcento(nome).toLowerCase(), nome]),
);

/**
 * Converte qualquer grafia de UF para o nome por extenso canônico.
 * Aceita sigla ("SP", "sp"), nome acentuado ("São Paulo") e nome com acento
 * errado ("Rorâima"). Devolve `null` quando o valor não é uma UF — cabe ao
 * chamador decidir o rótulo do desconhecido.
 */
export const normalizeEstado = (
  valor: string | null | undefined,
): string | null => {
  const bruto = String(valor ?? '').trim();
  if (!bruto) return null;

  if (bruto.length === 2) return UF_PARA_ESTADO[bruto.toUpperCase()] ?? null;

  return PORNOME.get(semAcento(bruto).toLowerCase()) ?? null;
};
