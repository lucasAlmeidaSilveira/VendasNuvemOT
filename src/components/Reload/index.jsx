import "./style.css"
import { IoReloadCircleSharp } from "react-icons/io5"
import { useOrders } from "../../context/OrdersContext"
import { useAnalytics } from "../../context/AnalyticsContext"

// eslint-disable-next-line react/prop-types
export function ButtonReload() {
	const { fetchData, store } = useOrders()
	const { fetchDataGoogle, fetchDataADSMeta } = useAnalytics()

	const handleReload = () => {
		fetchData() // Chama a função para buscar os dados da API
		fetchDataGoogle()
		fetchDataADSMeta()
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
