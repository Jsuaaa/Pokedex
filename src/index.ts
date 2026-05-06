import './index.css';
import { getPokemonsList } from './queries/GetPokemonsList';
import { getPokemonById } from './queries/GetPokemonById';
import { getPokemonSpecies } from './queries/GetPokemonSpecies';
import { getEvolutionChain } from './queries/GetEvolutionChain';
import { pLimit } from './lib/concurrency';
import { mapPokemonTier1, applyTier2 } from './lib/mapPokemon';
import { setState, getState, subscribe } from './state/store';
import { App } from './components/App';
import { POKEMON_LIMIT, FETCH_CONCURRENCY } from './config/constants';
import type { Creature } from './types/Creature';

const root = document.querySelector('#root')!;
const { root: appEl, addCreature, updateCreature } = App(POKEMON_LIMIT);
root.appendChild(appEl);

const allCreatures: Creature[] = [];

const list = await getPokemonsList(POKEMON_LIMIT, 0);

const tasks = list.results.map((_, i) => async () => {
  const id = i + 1;
  const pokemon = await getPokemonById(id);
  const creature = mapPokemonTier1(pokemon);
  allCreatures[i] = creature;
  addCreature(creature, i);
  return creature;
});

await pLimit(tasks, FETCH_CONCURRENCY);

setState({ creatures: allCreatures, loading: false });

const speciesCache = new Map<
  number,
  {
    species: Awaited<ReturnType<typeof getPokemonSpecies>>;
    chain: Awaited<ReturnType<typeof getEvolutionChain>>;
  }
>();

subscribe(async (state) => {
  const id = state.focusedId;
  if (id === null) return;
  if (speciesCache.has(id)) {
    const cached = speciesCache.get(id)!;
    const creature = getState().creatures.find((c) => c.id === id);
    if (!creature) return;
    const updated = applyTier2(creature, cached.species, cached.chain);
    updateCreature(updated);
    return;
  }
  try {
    const species = await getPokemonSpecies(id);
    const chain = await getEvolutionChain(species.evolution_chain.url);
    speciesCache.set(id, { species, chain });
    const creature = getState().creatures.find((c) => c.id === id);
    if (!creature) return;
    const updated = applyTier2(creature, species, chain);
    const updatedCreatures = getState().creatures.map((c) => (c.id === id ? updated : c));
    setState({ creatures: updatedCreatures });
    updateCreature(updated);
  } catch {
    // tier-2 data unavailable, card keeps tier-1 data
  }
});
