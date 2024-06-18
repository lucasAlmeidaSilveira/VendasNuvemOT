import * as XLSX from 'xlsx';

// Função para exportar a tabela para Excel
export function exportTableToExcel(tableId, filename = 'table.xlsx') {
  let table = document.getElementById(tableId);
  let workbook = XLSX.utils.table_to_book(table);
  XLSX.writeFile(workbook, filename);
}

// Função para formatar o valor em reais
export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar a data para "YYYY-MM-DD"
export function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() retorna 0-11, adicionar 1 para 1-12
  const day = date.getDate();

  // Preenche com zero à esquerda se necessário (para garantir o formato MM e DD)
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  return `${year}-${formattedMonth}-${formattedDay}`;
}

export function parseCurrency(value) {
  const number = Number(value.replace(/[^0-9,-]+/g, "").replace(",", "."));
  return isNaN(number) ? 0 : number;
}

export function calculateAverageTicket(orders) {
  if (orders.length === 0) return 0;

  const totalSum = orders.reduce((sum, order) => {
    const orderTotal = parseFloat(
      order.total.replace(/[.,]/g, '').replace(/(\d+)(\d{2})$/, '$1.$2'),
    );
    return sum + orderTotal;
  }, 0);

  return totalSum / orders.length;
}

// Função para formatar a data para ISO 8601
export function formatDateToISO(date) {
  return date.toISOString()
}