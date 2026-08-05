import { env } from '../utils/env';

export async function getProduct(store, id) {
  try {
    const response = await fetch(
      `${env.apiUrl}product/${store}/${id}`,
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
      `${env.apiUrl}categories/${store}`,
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
      `${env.apiUrl}product/${store}`,
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

// Cadastra um pedido manual (loja física / chatbot). Devolve o corpo já parseado:
// o backend responde 201 com { orderId, warnings } mesmo quando o dump gravou e uma
// etapa posterior falhou — é o `warnings` que permite avisar "lançado, mas pendente"
// em vez de dizer que nada foi cadastrado (e provocar reenvio duplicado).
export async function createOrder(newOrder, store = 'artepropria') {
  const response = await fetch(`${env.apiUrl}order/${store}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newOrder),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(body?.error || 'Erro ao cadastrar o pedido');
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return { status: response.status, ...(body || {}) };
}

// Exclui um pedido manual (loja física / chatbot) pelo order_id da listagem nova.
// Remove das duas bases (pedidos_<loja> + orders_shop), limpa os cupons vinculados e
// recalcula daily_sales do dia.
//
// O backend responde 207 quando o pedido foi excluído mas daily_sales NÃO foi recalculado
// — o Dashboard ficaria com o valor antigo. 207 passa no `response.ok`, então tratamos o
// caso explicitamente: é falha para quem chama, com a mensagem do backend.
export async function deleteManualOrder(orderId, store) {
  const response = await fetch(
    `${env.apiUrl}order/${store}/id/${encodeURIComponent(orderId)}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const body = await response.json().catch(() => null);

  if (!response.ok || response.status === 207) {
    const error = new Error(
      body?.dailySales?.erro || body?.error || body?.message || 'Erro ao excluir pedido',
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return { status: response.status, ...(body || {}) };
}

export async function deleteOrder(ownerNote, store) {
  try {
    const response = await fetch(
      `${env.apiUrl}order/${store}/${ownerNote}`,
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
      `${env.apiUrl}tiny/order/${id}/${cpf}`,
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
    return;
  } catch (error) {
    // console.log(error);
  }
}

export async function getLinkNoteTiny(id, cpf) {
  try {
    const response = await fetch(
      `${env.apiUrl}tiny/note/${id}/${cpf}`,
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
    return;
  } catch (error) {
    // console.log(error);
  }
}
