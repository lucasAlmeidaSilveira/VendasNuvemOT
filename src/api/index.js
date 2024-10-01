export async function getProduct(store, id) {
  try {
    const response = await fetch(
      `https://node-vendasnuvemot.onrender.com/product/${store}/${id}`,
    );
    if (!response.ok) {
      throw new Error('Erro ao buscar pedidos');
    }
    const data = await response.json();

    return data;
  } catch (err) {
    // throw err;
  }
}

export async function fetchCategories(store) {
  try {
    const response = await fetch(
      `https://node-vendasnuvemot.onrender.com/categories/${store}`,
    );
    if (!response.ok) {
      throw new Error('Erro ao buscar categorias');
    }
    const data = await response.json();

    return data;
  } catch (err) {
    throw err;
  }
}

export async function createProduct(store, body) {
  try {
    const response = await fetch(
      `https://node-vendasnuvemot.onrender.com/product/${store}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      },
    );

    if (!response.ok) {
      throw new Error('Erro ao cadastrar produto');
    }

    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createOrder(newOrder) {
  try {
    // Chama a rota do backend para adicionar o pedido
    const response = await fetch(
      'https://node-vendasnuvemot.onrender.com/order/artepropria',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      },
    );

    if (!response.ok) {
      throw new Error('Erro ao cadastrar o pedido');
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteOrder(ownerNote, store) {
  try {
    const response = await fetch(
      `https://node-vendasnuvemot.onrender.com/order/${store}/${ownerNote}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!response.ok) {
      throw new Error('Erro ao excluir pedido');
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getOrderTiny(id, cpf) {
  try {
    const response = await fetch(
      `https://node-vendasnuvemot.onrender.com/tiny/order/${id}/${cpf}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response) {
      return response.json();
    }
    return
  } catch (error) {
    console.log(error);
  }
}
