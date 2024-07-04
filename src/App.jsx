import "./App.css"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { useTab } from "./context/TabContext"
import { RoutesTabs } from "./tools/RoutesTabs"
import { useOrders } from "./context/OrdersContext"
import { FilterDate } from "./components/FilterDate"

function App() {
	const { activeTab } = useTab();
	const { date, setDate } = useOrders();

	return (
		<>
		<Header />
		<Footer />
		<FilterDate />
		<RoutesTabs activeTab={activeTab} />
		</>
	)
}

export default App
