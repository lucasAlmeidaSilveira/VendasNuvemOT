export function ClientDetails({ order }) {

  function createUrlPageBuy(id, token){
    const urlPageBuyCheckout = `https://www.outletdosquadros.com.br/checkout/v3/success/${id}/${token}`

    return urlPageBuyCheckout
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label='products table'>
        <TableHead>
          <TableRow>
            <StyledTableHeadCell>CPF</StyledTableHeadCell>
            <StyledTableHeadCell>Email</StyledTableHeadCell>
            <StyledTableHeadCell>Telefone</StyledTableHeadCell>
            <StyledTableHeadCell>Data da compra</StyledTableHeadCell>
            <StyledTableHeadCell>Página do pedido</StyledTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <StyledTableCell>{order.data.contact_identification}</StyledTableCell>
            <StyledTableCell>{order.data.contact_email}</StyledTableCell>
            <StyledTableCell>{order.data.contact_phone}</StyledTableCell>
            <StyledTableCell>{order.createdAt}</StyledTableCell>
            <StyledTableCell>
              <a href={createUrlPageBuy(order.id, order.data.token)} target="_blank">Link de acompanhamento</a>
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
