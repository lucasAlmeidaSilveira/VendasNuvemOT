export async function getProduct(store, id) {
  try {
    const response = await fetch(`https://node-vendasnuvemot.onrender.com/product/${store}/${id}`)
    if (!response.ok) {
      throw new Error("Erro ao buscar pedidos")
    }
    const data = await response.json()
    
    return data
    
  } catch (err) {
    throw err
  }
}