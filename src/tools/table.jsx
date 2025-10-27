import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { Box, TableHead, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Table } from '@radix-ui/themes';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'var(--geralblack-30)',
    color: 'var(--geralblack-100)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Poppins',
    padding: '14px 16px',
    whiteSpace: 'collapse',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: 'Poppins',
    padding: '8px 16px',
    lineHeight: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'collapse',
  },
  [`&.${'d-row'}`]: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '16px',
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd):not(.row-order)': {
    backgroundColor: 'var(--geralblack-10)',
  },
  '&.row-order': {
    backgroundColor: 'var(--geralblack-20)',
    borderRadius: '8px',
    '& div': {
      borderRadius: '8px',
    },
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export const headCells = [
  { id: 'order_id', numeric: false, disablePadding: false, label: 'Pedido' },
  { id: 'created_at', numeric: false, disablePadding: false, label: 'Data' },
  { id: 'client', numeric: false, disablePadding: false, label: 'Cliente' },
  { id: 'products', numeric: false, disablePadding: false, label: 'Produtos' },
  { id: 'total', numeric: true, disablePadding: false, label: 'Valor' },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Pagamento',
  },
  // {
  //   id: 'shipping_status',
  //   numeric: false,
  //   disablePadding: false,
  //   label: 'Status',
  // },
];

export const headCellsCreative = [
  { id: 'id', numeric: true, disablePadding: false, label: 'ID' },
  {
    id: 'impression',
    numeric: true,
    disablePadding: false,
    label: 'Impressões',
  },
  { id: 'click', numeric: true, disablePadding: false, label: 'Cliques' },
  { id: 'cost', numeric: true, disablePadding: false, label: 'Custo' },
  {
    id: 'conversions',
    numeric: true,
    disablePadding: false,
    label: 'Conversões',
  },
];

export const headCellsRefunds = [
  { id: 'order_id', numeric: false, disablePadding: false, label: 'Pedido' },
  { id: 'created_at', numeric: false, disablePadding: false, label: 'Data' },
  { id: 'category', numeric: false, disablePadding: false, label: 'Categoria' },
  { id: 'type_refund', numeric: false, disablePadding: false, label: 'Tipo' },
  { id: 'total', numeric: true, disablePadding: false, label: 'Valor' },
];

export const EnhancedTableHead = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <Table.Header style={{ backgroundColor: 'lightgray' }}>
      <Table.Row>
        {headCells.map((headCell) => (
          <Table.ColumnHeaderCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </Table.ColumnHeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
};

export const EnhancedTableHeadCreative = ({
  order,
  orderBy,
  onRequestSort,
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
    //console.log('DEBUG event: ', event);
    //console.log('DEBUG property: ', property);
  };

  return (
    <Table.Header style={{ backgroundColor: 'lightgray' }}>
      <Table.Row>
        {headCellsCreative.map((headCell) => (
          <Table.ColumnHeaderCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </Table.ColumnHeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
};

export const EnhancedTableHeadRefunds = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
    //console.log('DEBUG event: ', event);
    //console.log('DEBUG property: ', property);
  };

  return (
    <Table.Header style={{ backgroundColor: 'lightgray' }}>
      <Table.Row>
        {headCellsRefunds.map((headCell) => (
          <Table.ColumnHeaderCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </Table.ColumnHeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
};
