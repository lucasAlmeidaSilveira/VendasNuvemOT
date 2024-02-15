import { Container } from "./styles"

// eslint-disable-next-line react/prop-types
export function ListProduct({position, name, skuNumber, variations, urlImage, sales}){

	return (
		<Container>
			<div className="frame">
				<img className="image-product" src={urlImage} alt={name} />
				<div className="info-product">
					<p className="text-position">#{position}</p>
					<a className="name-product">{skuNumber} | {name}</a>
					{variations && (
						variations.map((variation, index) => (
							<p key={index} className="text-variant">{variation[0]}</p>
						))
					)}
				</div>
			</div>
			<p className="sales">{sales}</p>
		</Container>
	)
}