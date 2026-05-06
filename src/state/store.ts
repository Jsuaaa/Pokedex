import { Creature } from '../types/Creature';

export interface AppState {
  creatures: Creature[];
  query: string;
  activeType: string;
  focusedId: number | null;
  loading: boolean;
  total: number;
}

type Listener = (state: AppState) => void;

const state: AppState = {
  creatures: [],
  query: '',
  activeType: 'ALL',
  focusedId: null,
  loading: true,
  total: 0,
};

const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

export function setState(patch: Partial<AppState>): void {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getFiltered(): Creature[] {
  const { creatures, query, activeType } = state;
  return creatures.filter((c) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    const matchT = activeType === 'ALL' || c.types.includes(activeType);
    return matchQ && matchT;
  });
}
