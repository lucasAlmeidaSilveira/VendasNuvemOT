import { ContainerVariation } from "./styles";

export function ListVariation({ position, name, sales }) {

  return (
    <ContainerVariation>
      <div className="variation">
            <p className="text-position">#{position}</p>
          <div className="info-product">
            <p className="name-product">{name}</p>
          </div>
      </div>
      <p className="sales">{sales}</p>
    </ContainerVariation>
  );
}
