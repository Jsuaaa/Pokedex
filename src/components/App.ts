import { el } from '../lib/dom';
import { DexShell } from './DexShell';
import { SearchBar } from './SearchBar';
import { TypeFilters } from './TypeFilters';
import { Grid } from './Grid';
import { Footer } from './Footer';
import { subscribe, setState, getFiltered } from '../state/store';
import type { Creature } from '../types/Creature';

export function App(total: number): {
  root: HTMLElement;
  addCreature: (c: Creature, idx: number) => void;
  updateCreature: (c: Creature) => void;
} {
  const filtered = getFiltered();
  const { root: shellRoot, updateCounter } = DexShell(filtered.length, total);
  const searchBar = SearchBar();
  const { root: typeFiltersRoot, updateTypes } = TypeFilters();
  const { root: gridRoot, addCreature, updateCreature } = Grid();
  const footer = Footer(total);

  const controls = el('div', { class: 'controls' }, [searchBar, typeFiltersRoot]);
  shellRoot.appendChild(controls);

  const app = el('div', { class: 'app' }, [shellRoot, gridRoot, footer]);

  subscribe((state) => {
    const f = getFiltered();
    updateCounter(f.length, state.creatures.length);

    const allTypes = Array.from(
      new Set(state.creatures.flatMap((c) => c.types)),
    ).sort();
    updateTypes(allTypes);
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') setState({ focusedId: null });
  });

  return { root: app, addCreature, updateCreature };
}
