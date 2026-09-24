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

// --- Imagens AR 3D (mesmo backend do painel imgs-ar) --------------------------
//
// O envelope da API é sempre { success, message, data? }. Em erro, jogamos a
// message pra cima como Error pra quem chamou tratar num catch só.
async function parseWebarResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || !body?.success) {
    const error = new Error(
      body?.message || `Erro ${response.status} ao comunicar com a API`,
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body.data;
}

// Confere a chave de escrita e o storage antes de subir um arquivo, e de quebra
// acorda o backend (o free tier do Render hiberna e a 1ª requisição leva ~30-60s).
// Um POST sem corpo não chega a subir nada: o parser de bytes recusa com 415, que
// aqui significa "credencial e storage ok".
export async function checkWebarUploadReady() {
  const response = await fetch(`${env.apiUrl}webar/upload?id=1&slot=1`, {
    method: 'POST',
    headers: { 'x-api-key': env.webarWriteKey },
  });
  if (response.status === 415) return true;

  const body = await response.json().catch(() => null);
  throw new Error(body?.message || `Backend indisponível (HTTP ${response.status})`);
}

// POST /webar/upload?id=..&slot=.. → sobe a arte já processada e devolve
// { url, key }. O corpo é o Blob do canvas, que já carrega o Content-Type image/jpeg
// (sem ele o backend responde 415, porque o parser de bytes não reconhece o corpo).
export async function uploadWebarImage(blob, id, slot, timeoutMs = 60000) {
  // Sem timeout, um upload pendurado ocuparia o formulário para sempre.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `${env.apiUrl}webar/upload?id=${encodeURIComponent(id)}&slot=${slot}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || 'image/jpeg',
          'x-api-key': env.webarWriteKey,
        },
        body: blob,
        signal: controller.signal,
      },
    );
    return await parseWebarResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Tempo esgotado ao enviar a imagem ${slot} do produto ${id}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// POST /webar/images → cria ou substitui as imagens AR 3D do produto.
export async function saveWebarImages(store, id, productImages) {
  const response = await fetch(`${env.apiUrl}webar/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.webarWriteKey,
    },
    body: JSON.stringify({ store, id, product_images: productImages }),
  });
  return parseWebarResponse(response);
}
