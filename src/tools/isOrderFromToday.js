export function isOrderOnDate(orderCreatedAt, dateRange) {
	const [startDate, endDate] = dateRange

	// Convertendo a data do pedido para o fuso horário local
	const orderDate = new Date(orderCreatedAt)

	// Se startDate estiver definido, ajuste para o início do dia
	const start = startDate ? new Date(new Date(startDate).setHours(
		0, 0, 0, 0
	)) : null

	// Se endDate estiver definido, ajuste para o final do dia
	const end = endDate ? new Date(new Date(endDate).setHours(
		23, 59, 59, 999
	)) : null

	// Verifica se a data do pedido está dentro do intervalo
	const isAfterStart = !start || orderDate >= start
	const isBeforeEnd = !end || orderDate <= end

	return isAfterStart && isBeforeEnd
}




// export function isOrderOnDate(orderCreatedAt, date) {
// 	const orderDate = new Date(orderCreatedAt)

// 	// Convertendo a data do pedido para o fuso horário local
// 	const orderDateLocal = new Date(orderDate.getTime() - orderDate.getTimezoneOffset() * 60000)

// 	// Verificando se a data do pedido corresponde à data específica fornecida
// 	return (
// 		orderDateLocal.toDateString() === date.toDateString()
// 	)
// }