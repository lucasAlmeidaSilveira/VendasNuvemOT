export async function fetchVisits(){

  try {
    const response = await axios.get('/api/visits', { params: { date } });
    return response.data.visits;
  } catch (error) {
    console.error('Erro ao buscar visitas:', error);
  }

};