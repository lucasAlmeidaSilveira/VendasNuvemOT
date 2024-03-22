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
};