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

export async function fetchCategories(store) {
  try {
    const response = await fetch(`https://node-vendasnuvemot.onrender.com/categories/${store}`)
    if (!response.ok) {
      throw new Error("Erro ao buscar categorias")
    }
    const data = await response.json()
    
    return data
    
  } catch (err) {
    throw err
  }
}

export async function createProduct(store, body) {
  try {
    const response = await fetch(`https://node-vendasnuvemot.onrender.com/product/${store}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ body })
    });

    if (!response.ok) {
      throw new Error("Erro ao cadastrar produto");
    }

    return response
  } catch (err) {
    console.error(err);
    throw err;
  }
}
