import { Container } from "./styles"

// eslint-disable-next-line react/prop-types
export function ListVariation({position, name, sales}){

	return (
		<Container>
			<div className="frame">
				<div className="info-product">
					<p className="text-position">#{position}</p>
					<a className="name-product">{name}</a>
				</div>
			</div>
			<p className="sales">{sales}</p>
		</Container>
	)
}