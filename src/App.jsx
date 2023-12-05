import "./App.css"
import { Header } from "./components/Header"
import { Dashboard } from "./components/Dashboard"
import { useState } from "react"

function App() {
	const [orders, setOrders] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	const fetchData = async () => {
		try {
			const response = await fetch("https://node-vendasnuvemot.onrender.com/orders")
			if (!response.ok) {
				throw new Error("Erro ao buscar pedidos")
			}
			const productList = await response.json()
			setOrders(productList) // Atualize o estado com os dados recebidos
			setIsLoading(false)
		} catch (error) {
			console.error(error)
			setIsLoading(false)
		}
	}

	return (
		<>
			<Header fetchData={fetchData}/>
			<Dashboard orders={orders} isLoading={isLoading}/>
		</>
	)
}

export default App
