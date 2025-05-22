import { useEffect, useState } from "react";
import { Container } from "./styles";
import { formatCurrency, formatUrlProduct } from "../../tools/tools";

export function ListProduct({ idProduct, position, name, skuNumber, variations, landingUrl, urlImage, sales, totalSales }) {
  const [urlProduct, setUrlProduct ] = useState()
  
  useEffect(() => {
    if(landingUrl){
      setUrlProduct(() => formatUrlProduct(landingUrl))
    }
  }, [landingUrl])

  return (
    <Container>
      <div className="frame">
        {urlImage && <img className="image-product" src={urlImage} alt={name} />}
        {urlImage ? (
          <a href={urlImage} target="_blank" className="info-product">
            <p className="text-position">#{position}</p>
            <p className="name-product">{skuNumber ? skuNumber + ' | ' : ''} {name}</p>
            {variations && <p className="text-variant">{variations}</p>}
            <div className="sales-container">
              <p className="text-sales">Total: {formatCurrency(totalSales)}</p>
              <p className="sales">Vendas: {sales}</p>
            </div>
          </a>
        ) : (
          <div className="info-product">
            <p className="text-position">#{position}</p>
            <p className="name-product">{skuNumber ? skuNumber + ' | ' : ''} {name}</p>
            {variations && <p className="text-variant">{variations}</p>}
          </div>
        )}
      </div>
    </Container>
  );
}
