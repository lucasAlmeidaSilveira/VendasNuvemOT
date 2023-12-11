import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { OrdersProvider } from "./context/OrdersContext" // Importe o provedor do contexto

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<React.StrictMode>
	<OrdersProvider> {/* Envolver App com OrdersProvider */}
		<App />
	</OrdersProvider>
</React.StrictMode>)
