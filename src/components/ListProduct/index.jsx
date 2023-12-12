// eslint-disable-next-line react/prop-types
export function ListProduct({urlImage, name, sales}){
	return (
		<div className="list-product">
			<div className="frame">
				<img className="vector" src={urlImage} alt={name} />
				<div className="div">
					<p className="name-product">{name}</p>
					<div className="frame-2">
						<div>
							<div className="text-variations">Variações</div>
							<img src="arrow" alt={arrow} />
						</div>
					</div>
				</div>
			</div>
			<div className="sales">{sales}</div>
		</div>
	)
}