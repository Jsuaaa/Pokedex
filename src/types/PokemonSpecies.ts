interface NamedAPIResource {
  name: string;
  url: string;
}

interface FlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
}

interface Genus {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: FlavorTextEntry[];
  genera: Genus[];
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  evolution_chain: { url: string };
}
