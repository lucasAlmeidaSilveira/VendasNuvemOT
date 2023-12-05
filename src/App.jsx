import "./App.css"
import { Header } from "./components/Header"
import { Dashboard } from "./components/Dashboard"
import { useState } from "react"

function App() {
	const [orders, setOrders] = useState([])

	const handleReload = () => {
		fetchData()
	}

	const fetchData = async () => {
		try {
			const response = await fetch("https://node-vendasnuvemot.onrender.com/orders")
			if (!response.ok) {
				throw new Error("Erro ao buscar pedidos")
			}
			const productList = await response.json()
			setOrders(productList) // Atualize o estado com os dados recebidos

		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<Header fetchData={fetchData}/>
			<Dashboard orders={orders}/>
		</>
	)
}

export default App
