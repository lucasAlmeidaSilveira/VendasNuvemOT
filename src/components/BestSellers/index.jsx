import { useOrders } from "../../context/OrdersContext"

// eslint-disable-next-line react/prop-types
export function BestSellers({ categorie, salesCategoria }){
	const { orders, isLoading, date, setDate } = useOrders()

	return(
		<div className="quadros">
			<header className="header">
				<div className="">{categorie}</div>
				<div>{salesCategoria}</div>
			</header>
		</div>
	)
}