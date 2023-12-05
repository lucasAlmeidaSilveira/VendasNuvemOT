import { useEffect, useState } from "react"
import "./style.css"
import { IoReloadCircleSharp } from "react-icons/io5"

// eslint-disable-next-line react/prop-types
export function ButtonReload({ fetchData }) {
	const handleReload = () => {
		fetchData() // Chama a função para buscar os dados da API
	}	

	return (
		<button
			className="boxReload"
			onClick={handleReload}
		>
			<IoReloadCircleSharp
				color="#FCFAFB"
				fontSize="40"
				alt="Recarregar página"
			/>
		</button>
	)
}
