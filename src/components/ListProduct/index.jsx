import { Container } from "./styles"

// eslint-disable-next-line react/prop-types
export function ListProduct({idProduct, position, name, skuNumber, variations, urlImage, sales}){
	const baseUrl = "https://outletdosquadros.lojavirtualnuvem.com.br/admin/v2/products/"
	const urlProduct = baseUrl + idProduct

	return (
		<Container>
			<div className="frame">
				<img className="image-product" src={urlImage} alt={name} />
				<a href={urlProduct} target="_blank" className="info-product">
					<p className="text-position">#{position}</p>
					<p className="name-product">{skuNumber} | {name}</p>
					{variations && (
						variations.map((variation, index) => (
							<p key={index} className="text-variant">{variation[0]}</p>
						))
					)}
				</a>
			</div>
			<p className="sales">{sales}</p>
		</Container>
	)
}