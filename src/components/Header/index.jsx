import { Logotipo } from "../Logo/index.jsx"
import { ButtonReload } from "../Reload/index.jsx"
import { Container } from "./styles.ts"

// eslint-disable-next-line react/prop-types
export function Header(){

	return (
		<Container >
			<div className="div">
				<Logotipo />
				<div className="div-2">
					<div className="text-wrapper">Vendas</div>
					<div className="text-wrapper-2">Outlet dos Quadros</div>
				</div>
			</div>
			<ButtonReload />
		</Container>
	)
}