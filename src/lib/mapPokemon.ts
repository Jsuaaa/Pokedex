import { Pokemon } from '../types/Pokemon';
import { PokemonSpecies } from '../types/PokemonSpecies';
import { EvolutionChain } from '../types/EvolutionChain';
import { Creature } from '../types/Creature';

const GENERATION_REGION: Record<string, string> = {
  'generation-i': 'KANTO',
  'generation-ii': 'JOHTO',
  'generation-iii': 'HOENN',
  'generation-iv': 'SINNOH',
  'generation-v': 'UNOVA',
  'generation-vi': 'KALOS',
  'generation-vii': 'ALOLA',
  'generation-viii': 'GALAR',
  'generation-ix': 'PALDEA',
};

function getStat(pokemon: Pokemon, name: string): number {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

function flattenChain(
  chain: EvolutionChain['chain'],
  result: string[] = [],
): string[] {
  result.push(chain.species.name);
  if (chain.evolves_to.length > 0) {
    flattenChain(chain.evolves_to[0], result);
  }
  return result;
}

export function mapPokemonTier1(pokemon: Pokemon): Creature {
  return {
    id: pokemon.id,
    name: pokemon.name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    category: '...',
    types: pokemon.types.map((t) => t.type.name),
    height: `${(pokemon.height / 10).toFixed(1)} m`,
    weight: `${(pokemon.weight / 10).toFixed(1)} kg`,
    hp: getStat(pokemon, 'hp'),
    atk: getStat(pokemon, 'attack'),
    def: getStat(pokemon, 'defense'),
    spd: getStat(pokemon, 'speed'),
    sprite:
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
    lore: '...',
    habitat: '...',
    region: '...',
    evo: [pokemon.name],
    evoStage: 0,
  };
}

export function applyTier2(
  creature: Creature,
  species: PokemonSpecies,
  chain: EvolutionChain,
): Creature {
  const englishGenus = species.genera.find((g) => g.language.name === 'en');
  const category = englishGenus?.genus ?? creature.category;

  const flavorEntry = species.flavor_text_entries.find(
    (e) => e.language.name === 'en',
  );
  const lore = flavorEntry
    ? flavorEntry.flavor_text.replace(/[\n\f\r]/g, ' ').trim()
    : creature.lore;

  const habitat = species.habitat?.name
    ? species.habitat.name
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')
    : 'Unknown';

  const region =
    GENERATION_REGION[species.generation.name] ?? species.generation.name.toUpperCase();

  const evo = flattenChain(chain.chain);
  const evoStage = evo.findIndex((n) => n === species.name);

  return {
    ...creature,
    category,
    lore,
    habitat,
    region,
    evo: evo.map((n) =>
      n.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
    evoStage: evoStage >= 0 ? evoStage : 0,
  };
}
