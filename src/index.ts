import './index.css';
import { getPokemonsList } from './queries/GetPokemonsList';
import { getPokemonById } from './queries/GetPokemonById';
import { getPokemonSpecies } from './queries/GetPokemonSpecies';
import { getEvolutionChain } from './queries/GetEvolutionChain';
import { pLimit } from './lib/concurrency';
import { parseIdFromUrl } from './lib/parseId';
import { mapPokemonTier1, applyTier2 } from './lib/mapPokemon';
import { setState, getState, subscribe } from './state/store';
import { App } from './components/App';
import { StartOverlay } from './components/StartOverlay';
import { MuteToggle } from './components/MuteToggle';
import { playMusic, setMusicMuted } from './lib/audio';
import musicUrl from './assets/red-theme.mp3';
import { BATCH_SIZE, FETCH_CONCURRENCY, OBSERVER_ROOT_MARGIN } from './config/constants';
import type { Creature } from './types/Creature';
import type { PokemonList } from './types/PokemonList';

const root = document.querySelector('#root')!;

// Mount PRESS START overlay synchronously before the first await,
// so the user sees it while the initial fetch is in flight.
const start = StartOverlay({
  onStart: () => playMusic(musicUrl, { volume: 0.3, loop: true }),
  onSkip: () => setMusicMuted(true),
});
document.body.appendChild(start.root);

// Fetch first page before mounting so we know the real total
const firstList = await getPokemonsList(BATCH_SIZE, 0);
const total = firstList.count;
setState({ total });

const { root: appEl, addCreature, updateCreature } = App(total);
root.appendChild(appEl);
document.body.appendChild(MuteToggle().root);

// Process a list page: fetch details in parallel, add cards to DOM, return creatures
async function processBatch(list: PokemonList): Promise<Creature[]> {
  const batchCreatures: Creature[] = [];

  const tasks = list.results.map((r, i) => async () => {
    let id: number;
    try {
      id = parseIdFromUrl(r.url);
    } catch {
      return;
    }
    try {
      const pokemon = await getPokemonById(id);
      const creature = mapPokemonTier1(pokemon);
      // batch-local idx so animation-delay stays within 0..BATCH_SIZE*0.07s
      addCreature(creature, i);
      batchCreatures.push(creature);
    } catch {
      // skip individual failures silently
    }
  });

  await pLimit(tasks, FETCH_CONCURRENCY);
  return batchCreatures;
}

// Load and commit the first batch (reusing already-fetched firstList)
const firstBatch = await processBatch(firstList);
setState({ creatures: [...getState().creatures, ...firstBatch], loading: false });

let offset = firstList.results.length;

// Infinite scroll machinery
let inFlight = false;
let sentinel: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;

function getSentinel(): HTMLElement {
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.className = 'grid-sentinel';
  }
  return sentinel;
}

function setSentinelState(s: 'idle' | 'loading' | 'error') {
  const el = getSentinel();
  el.className = s === 'idle' ? 'grid-sentinel' : `grid-sentinel grid-sentinel--${s}`;
}

function teardownSentinel() {
  if (observer) { observer.disconnect(); observer = null; }
  if (sentinel && sentinel.parentNode) sentinel.remove();
  sentinel = null;
}

async function loadNextBatch() {
  if (inFlight) return;
  if (offset >= total) return;
  inFlight = true;
  setSentinelState('loading');
  try {
    const list = await getPokemonsList(BATCH_SIZE, offset);
    const batch = await processBatch(list);
    setState({ creatures: [...getState().creatures, ...batch] });
    offset += list.results.length;
    if (offset >= total) {
      teardownSentinel();
    } else {
      setSentinelState('idle');
    }
  } catch {
    setSentinelState('error');
  } finally {
    inFlight = false;
  }
}

function setupSentinel() {
  if (offset >= total) return;

  const grid = appEl.querySelector('.grid');
  if (!grid || !grid.parentNode) return;

  const el = getSentinel();
  el.addEventListener('click', () => {
    if (el.classList.contains('grid-sentinel--error')) {
      loadNextBatch();
    }
  });

  // Sibling of .grid (not child): new cards get appendChild'd into .grid,
  // so a child sentinel would get sandwiched between batches. As a sibling,
  // it always stays at the end of the scrollable content.
  grid.parentNode.insertBefore(el, grid.nextSibling);

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadNextBatch();
    },
    { rootMargin: OBSERVER_ROOT_MARGIN },
  );
  observer.observe(el);
}

// Mount sentinel after first batch is committed
setupSentinel();

// Tier-2: species + evolution chain on focus (unchanged)
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
