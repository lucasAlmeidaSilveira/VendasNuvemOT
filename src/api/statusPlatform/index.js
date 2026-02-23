import { env } from "../../utils/env";

export async function getStatusPlatform({ platform }) {
  try {
    const response = await fetch(`${env.apiUrl}status/platform/${platform}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar status da plataforma');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
}