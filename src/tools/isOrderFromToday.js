export function isOrderOnDate(orderCreatedAt, date) {
	const orderDate = new Date(orderCreatedAt)

	// Convertendo a data do pedido para o fuso horário local
	const orderDateLocal = new Date(orderDate.getTime() - orderDate.getTimezoneOffset() * 60000)

	// Verificando se a data do pedido corresponde à data específica fornecida
	return (
		orderDateLocal.toDateString() === date.toDateString()
	)
}