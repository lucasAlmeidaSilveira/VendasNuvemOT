import { Container } from "./styles"

// eslint-disable-next-line react/prop-types
export function InputSelect({ setNumberProducts }) {
	const handleChange = (event) => {
		// Atualizar o estado com o número de produtos selecionados
		setNumberProducts(() => parseInt(event.target.value))
	}

	return (
		<Container>
			<select name="Quantidade" onChange={handleChange}>
				<option value={5}>5 mais vendidos</option>
				<option value={10}>10 mais vendidos</option>
				<option value={15}>15 mais vendidos</option>
				<option value={20}>20 mais vendidos</option>
				<option value={50}>50 mais vendidos</option>
				<option value={100}>100 mais vendidos</option>
			</select>
		</Container>
	)
}
