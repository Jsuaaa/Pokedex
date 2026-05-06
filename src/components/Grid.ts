import { el } from '../lib/dom';
import { Creature } from '../types/Creature';
import { Card3D } from './Card3D';
import { getState, setState, subscribe } from '../state/store';

interface CardEntry {
  wrap: HTMLElement;
  setFocused: (f: boolean) => void;
  updateCreature: (c: Creature) => void;
  id: number;
}

export function Grid(): { root: HTMLElement; addCreature: (c: Creature, idx: number) => void; updateCreature: (c: Creature) => void } {
  const grid = el('div', { class: 'grid' });
  const cardMap = new Map<number, CardEntry>();
  let overlayEl: HTMLElement | null = null;

  function getOverlay(): HTMLElement {
    if (!overlayEl) {
      overlayEl = el('div', { class: 'focus-overlay' });
      overlayEl.addEventListener('click', () => setState({ focusedId: null }));
    }
    return overlayEl;
  }

  subscribe((state) => {
    const { focusedId, creatures, query, activeType, total } = state;

    const q = query.toLowerCase();
    const filtered = creatures.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchT = activeType === 'ALL' || c.types.includes(activeType);
      return matchQ && matchT;
    });

    const filteredIds = new Set(filtered.map((c) => c.id));

    let visibleCount = 0;
    cardMap.forEach((entry) => {
      const visible = filteredIds.has(entry.id);
      entry.wrap.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    cardMap.forEach((entry) => {
      entry.setFocused(entry.id === focusedId);
    });

    grid.classList.toggle('grid--has-focus', focusedId !== null);

    let emptyEl = grid.querySelector('.empty') as HTMLElement | null;
    if (visibleCount === 0 && cardMap.size > 0) {
      const subMsg =
        creatures.length < total
          ? 'Scroll to load more entries'
          : 'Try a different search or type filter.';
      if (!emptyEl) {
        emptyEl = el('div', { class: 'empty' }, [
          el('div', { class: 'empty-icon' }, ['∅']),
          el('div', { class: 'empty-msg' }, ['NO ENTRIES FOUND']),
          el('div', { class: 'empty-sub' }, [subMsg]),
        ]);
        grid.appendChild(emptyEl);
      } else {
        const sub = emptyEl.querySelector('.empty-sub');
        if (sub) sub.textContent = subMsg;
      }
    } else if (emptyEl) {
      emptyEl.remove();
    }

    const appEl = grid.closest('.app');
    if (focusedId !== null) {
      if (!document.body.contains(getOverlay())) {
        (appEl ?? document.body).insertBefore(getOverlay(), grid.nextSibling);
      }
    } else if (overlayEl && document.body.contains(overlayEl)) {
      overlayEl.remove();
    }
  });

  function addCreature(creature: Creature, idx: number) {
    const entry = Card3D(
      creature,
      idx,
      () => setState({ focusedId: creature.id }),
      () => setState({ focusedId: null }),
      () => getState().focusedId === creature.id,
    );
    cardMap.set(creature.id, { ...entry, id: creature.id });
    grid.appendChild(entry.wrap);
  }

  function updateCreature(creature: Creature) {
    const entry = cardMap.get(creature.id);
    if (entry) {
      entry.updateCreature(creature);
    }
  }

  return { root: grid, addCreature, updateCreature };
}
