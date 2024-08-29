import { useEffect, useState } from "react";
import { Container } from "./styles";
import { getProduct } from "../../api";
import { useOrders } from "../../context/OrdersContext";

export function ListProduct({ idProduct, position, name, skuNumber, variations, urlImage, sales }) {
  const { store } = useOrders();
  const [urlProduct, setUrlProduct] = useState(''); // Estado para armazenar a URL do produto

  useEffect(() => {
    if (urlImage) {
      // Função assíncrona para buscar a URL do produto
      const fetchProductUrl = async () => {
        try {
          const { canonical_url } = await getProduct(store, idProduct);
          setUrlProduct(canonical_url); // Atualiza o estado com a URL obtida
        } catch (error) {
          // console.error("Failed to fetch product URL:", error);
          setUrlProduct(""); // Em caso de erro, define a URL como string vazia
        }
      };

      fetchProductUrl(); // Chama a função assíncrona
    }
  }, [store, idProduct, urlImage]);

  return (
    <Container>
      <div className="frame">
        {urlImage && <img className="image-product" src={urlImage} alt={name} />}
        {urlImage ? (
          <a href={urlProduct} target="_blank" className="info-product">
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
