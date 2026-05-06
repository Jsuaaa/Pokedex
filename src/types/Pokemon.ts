interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

interface PokemonType {
  type: { name: string };
}

interface PokemonSprites {
  front_default: string | null;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
}
