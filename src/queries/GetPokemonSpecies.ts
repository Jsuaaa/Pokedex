import { POKEDEX_SPECIES_URL } from '../config/constants';
import { fetchData } from './FetchData';
import { PokemonSpecies } from '../types/PokemonSpecies';

export async function getPokemonSpecies(id: number): Promise<PokemonSpecies> {
  const response = await fetchData<PokemonSpecies>(
    `${POKEDEX_SPECIES_URL}/${id}`,
  );

  if (!response.data) {
    const message = response.error?.message;
    const status = response.error?.status;
    throw new Error(
      `Message: ${message}${status ? ` - Status: ${status}` : ''}`,
    );
  }

  return response.data;
}
