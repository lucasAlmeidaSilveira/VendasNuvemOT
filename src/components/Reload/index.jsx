import "./style.css"
import { IoReloadCircleSharp } from "react-icons/io5"
import { useOrders } from "../../context/OrdersContext"

// eslint-disable-next-line react/prop-types
export function ButtonReload() {
	const { fetchData } = useOrders()

	const handleReload = () => {
		fetchData() // Chama a função para buscar os dados da API
	}	

	return (
		<button
			className="boxReload"
			onClick={handleReload}
			aria-label="Recarregar dados"
		>
			<IoReloadCircleSharp
				color="#FCFAFB"
				fontSize="40"
			/>
		</button>
	)
}
