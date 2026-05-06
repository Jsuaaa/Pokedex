import { fetchData } from './FetchData';
import { EvolutionChain } from '../types/EvolutionChain';

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  const response = await fetchData<EvolutionChain>(url);

  if (!response.data) {
    const message = response.error?.message;
    const status = response.error?.status;
    throw new Error(
      `Message: ${message}${status ? ` - Status: ${status}` : ''}`,
    );
  }

  return response.data;
}
