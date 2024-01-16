import React from "react"
import { useOrders } from "../../context/OrdersContext.jsx"
import { Logotipo } from "../Logo/index.jsx"
import { ButtonReload } from "../Reload/index.jsx"
import { Container } from "./styles.ts"

export function Header() {
	const { store, setStore, resetData } = useOrders()

	// Função para lidar com a mudança do select
	const handleStoreChange = (event) => {
		resetData()
		setStore(event.target.value)
	}

	return (
		<Container>
			<div className="div">
				<Logotipo store={store} />
				<div className="div-2">
					<div className="text-wrapper">Vendas</div>
					<select
						className="store-select"
						value={store}
						onChange={handleStoreChange}
					>
						<option value="outlet">Outlet</option>
						<option value="artepropria">Arte Própria</option>
					</select>
				</div>
			</div>
			<ButtonReload />
		</Container>
	)
}
