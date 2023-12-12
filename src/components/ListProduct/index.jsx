import { Container } from "./styles"

// eslint-disable-next-line react/prop-types
export function ListProduct({position, name, urlImage, sales}){

	return (
		<Container>
			<div className="frame">
				<img className="image-product" src={urlImage} alt={name} />
				<div className="info-product">
					<p className="text-position">#{position}</p>
					<a className="name-product">{name}</a>
				</div>
			</div>
			<p className="sales">{sales}</p>
		</Container>
	)
}