import { useEffect, useState } from "react";
import { Container } from "./styles";
import { getProduct } from "../../api";
import { useOrders } from "../../context/OrdersContext";

export function ListProduct({ idProduct, position, name, skuNumber, variations, urlImage, sales }) {

  return (
    <Container>
      <div className="frame">
        {urlImage && <img className="image-product" src={urlImage} alt={name} />}
        {urlImage ? (
          <a href={urlImage} target="_blank" className="info-product">
            <p className="text-position">#{position}</p>
            <p className="name-product">{skuNumber ? skuNumber + ' | ' : ''} {name}</p>
            {variations && <p className="text-variant">{variations}</p>}
          </a>
        ) : (
          <div className="info-product">
            <p className="text-position">#{position}</p>
            <p className="name-product">{skuNumber ? skuNumber + ' | ' : ''} {name}</p>
            {variations && <p className="text-variant">{variations}</p>}
          </div>
        )}
      </div>
      <p className="sales">{sales}</p>
    </Container>
  );
}
