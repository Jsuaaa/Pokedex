interface NamedAPIResource {
  name: string;
  url: string;
}

interface ChainLink {
  species: NamedAPIResource;
  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}
