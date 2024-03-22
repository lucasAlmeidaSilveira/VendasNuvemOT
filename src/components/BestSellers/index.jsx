import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { ListProduct } from '../ListProduct';
import { ContainerBestSellers, ContainerBestSeller, Container } from './styles';
import { Loading } from '../Loading';
import { Oval } from 'react-loader-spinner';
import { InputSelect } from '../InputSelect';
import { ListProductTable } from '../ListProductTable';
import { exportTableToExcel } from '../../tools/tools';

export function BestSellers() {
	const { orders, isLoading, date, store } = useOrders()
	const [ quadrosSales, setQuadrosSales ] = useState(0)
	const [ espelhosSales, setEspelhosSales ] = useState(0)
	const [ quadrosProducts, setQuadrosProducts ] = useState([])
	const [ espelhosProducts, setEspelhosProducts ] = useState([])
	const [ numberProducts, setNumberProducts ] = useState(5)

	useEffect(() => {
		let quadros = {}
		let espelhos = {}

		orders.forEach((order) => {
			order.products.forEach((product) => {
				const productData = {
					id: product.id,
          skuNumber: product.sku.split("-")[0],
					name: product.name.replace(/\(.*?\)/g, "").trim(),
					image: product.image.src,
					sales: 1
				}

				if (product.name.includes("Quadro")) {
					if (quadros[product.product_id]) {
						quadros[product.product_id].sales += 1
					} else {
						quadros[product.product_id] = productData
					}
				} else if (product.name.includes("Espelho")) {
					if (espelhos[product.product_id]) {
						espelhos[product.product_id].sales += 1
					} else {
						espelhos[product.product_id] = productData
					}
				}
			})
		})

		// Ordenar os produtos de quadros por vendas (do maior para o menor)
		const sortedQuadros = Object.values(quadros).sort((a, b) => b.sales - a.sales)

		// Ordenar os produtos de espelhos por vendas (do maior para o menor)
		const sortedEspelhos = Object.values(espelhos).sort((a, b) => b.sales - a.sales)

		// Pegar apenas o número de produtos definido em numberProducts
		const listQuadros = sortedQuadros.slice(0, numberProducts)
		const listEspelhos = sortedEspelhos.slice(0, numberProducts)

		setQuadrosProducts(listQuadros)
		setEspelhosProducts(listEspelhos)
		setQuadrosSales(sortedQuadros.reduce((acc, item) => acc + item.sales, 0))
		setEspelhosSales(sortedEspelhos.reduce((acc, item) => acc + item.sales, 0))

	}, [ orders, numberProducts, date, store ])

  return (
		<Container>
			<div className="header-container">
				<h1>Mais vendidos</h1>
				<InputSelect setNumberProducts={setNumberProducts} />
			</div>
			<ContainerBestSellers>
				<ContainerBestSeller>
					<header className="header">
						<h2 className="categorie">Quadros</h2>
						{isLoading ? (
							<Oval
								height={16}
								width={16}
								color="#FCFAFB"
								visible={true}
								ariaLabel='oval-loading'
								strokeWidth={4}
								strokeWidthSecondary={4}
							/>
						): (
							<h2 className="sales-cetegorie">
								{quadrosSales}
							</h2>
						)}
					</header>
					<div className="table">
						{isLoading ? (
							<div className="loading">
								<Loading color={"#1F1F1F"} />
							</div>
						):(
							quadrosProducts.map((product, index) => (
								<ListProduct key={product.id} position={index + 1} skuNumber={product.skuNumber} name={product.name} sales={product.sales} urlImage={product.image} />
							))
						)}
					</div>
				</ContainerBestSeller>

				<ContainerBestSeller>
					<header className="header">
						<h2 className="categorie">Espelhos</h2>
						{isLoading ? (
							<Oval
								height={16}
								width={16}
								color="#FCFAFB"
								visible={true}
								ariaLabel='oval-loading'
								strokeWidth={4}
								strokeWidthSecondary={4}
							/>
						): (
							<h2 className="sales-cetegorie">
								{espelhosSales}
							</h2>
						)}
					</header>
					<div className="table">
						{isLoading ? (
							<div className="loading">
								<Loading color={"#1F1F1F"} />
							</div>
						):(
							espelhosProducts.map((product, index) => (
								<ListProduct key={product.id} position={index + 1} skuNumber={product.skuNumber} name={product.name} sales={product.sales} urlImage={product.image} />
							))
						)}
					</div>
				</ContainerBestSeller>
			</ContainerBestSellers>
		</Container>
	)
}