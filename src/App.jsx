import "./App.css"
import { Header } from "./components/Header"
import { Dashboard } from "./components/Dashboard"
import { useState } from "react"
import { Footer } from "./components/Footer"
import { useTab } from "./context/TabContext"
import { Coupons } from "./components/Coupons"
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
