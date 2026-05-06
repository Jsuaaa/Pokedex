import { fetchData } from './FetchData';
import { POKEDEX_API_URL } from '../config/constants';
import { PokemonList } from '../types/PokemonList';

export async function getPokemonsList(
  limit = 20,
  offset = 0,
): Promise<PokemonList> {
  const response = await fetchData<PokemonList>(POKEDEX_API_URL, {
    queryParams: { limit, offset },
  });

  if (!response.data) {
    const message = response.error?.message;
    const status = response.error?.status;
    throw new Error(
      `Message: ${message}${status ? ` - Status: ${status}` : ''}`,
    );
  }

  return response.data;
}
