export function ListProductTable({ products }) {
  return (
    <table id='tableId' style={{display: "none"}}>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nome do Produto</th>
          <th>Variação</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) =>
          product.variations.map((variation, varIndex) => (
            <tr key={`${index}-${varIndex}`}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>{variation[0]}</td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}
