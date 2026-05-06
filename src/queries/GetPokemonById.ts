import { POKEDEX_API_URL } from '../config/constants';
import { fetchData } from './FetchData';
import { Pokemon } from '../types/Pokemon';

export async function getPokemonById(id: number): Promise<Pokemon> {
  const response = await fetchData<Pokemon>(`${POKEDEX_API_URL}/${id}`);

  if (!response.data) {
    const message = response.error?.message;
    const status = response.error?.status;
    throw new Error(
      `Message: ${message}${status ? ` - Status: ${status}` : ''}`,
    );
  }

  return response.data;
}
