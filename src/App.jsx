import "./App.css"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { useTab } from "./context/TabContext"
import { RoutesTabs } from "./tools/RoutesTabs"

function App() {
	const { activeTab } = useTab();

	return (
		<>
		<Header />
		<Footer />
		<RoutesTabs activeTab={activeTab} />
		</>
	)
}

export default App
