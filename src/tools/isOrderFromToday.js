export function isOrderOnDate(orderCreatedAt, date) {
	const [ startDate, endDate ] = date
	const orderDate = new Date(orderCreatedAt)

	// Convertendo as datas do intervalo para objetos Date, se não forem null
	const start = startDate ? new Date(startDate) : null
	const end = endDate ? new Date(endDate) : null

	// Convertendo a data do pedido para o fuso horário local
	const orderDateLocal = new Date(orderDate.getTime() - orderDate.getTimezoneOffset() * 60000)

	if (start && end) {
		// Verifica se a data do pedido está dentro do intervalo
		return orderDate >= start && orderDate <= end
	} else if (start) {
		// Verifica se a data do pedido é após a data de início do intervalo
		return orderDate >= start
	} else if (end) {
		// Verifica se a data do pedido é antes da data de término do intervalo
		return orderDate <= end
	}

	// Se nenhuma data de início ou término for fornecida, retorna false
	return false
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