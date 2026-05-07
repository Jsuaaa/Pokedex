import { el } from '../lib/dom';
import type { Creature } from '../types/Creature';
import { Card3D } from './Card3D';
import { getState, setState, subscribe } from '../state/store';

const GAP_X = 24;
const GAP_Y = 32;
const MIN_CARD_W = 280;

interface PoolEntry {
  wrap: HTMLElement;
  setFocused: (f: boolean) => void;
  updateCreature: (c: Creature) => void;
}

// Wraps Card3D so that onFocus/isFocused closures always read the current
// pokemon id even after the entry is recycled for a different pokemon.
function createEntry(creature: Creature): PoolEntry {
  let currentId = creature.id;
  const card = Card3D(
    creature,
    0,
    () => setState({ focusedId: currentId }),
    () => setState({ focusedId: null }),
    () => getState().focusedId === currentId,
  );
  return {
    wrap: card.wrap,
    setFocused: card.setFocused,
    updateCreature(c: Creature) {
      currentId = c.id;
      card.updateCreature(c);
    },
  };
}

export function Grid(): {
  root: HTMLElement;
  addCreature: (c: Creature, idx: number) => void;
  updateCreature: (c: Creature) => void;
} {
  // wrapper is the public root; gridEl is the virtual canvas with absolute children
  const wrapper = el('div', { class: 'grid-wrapper' });
  const gridEl = el('div', { class: 'grid' });
  wrapper.appendChild(gridEl);

  const creaturesMap = new Map<number, Creature>();
  const batchIdxMap = new Map<number, number>(); // batch-local idx for enter animation stagger
  const active = new Map<number, PoolEntry>();
  const pool: PoolEntry[] = [];
  const entered = new Set<number>(); // ids that have already played the enter animation

  let cols = 1;
  let cardW = MIN_CARD_W;
  let cardH = (MIN_CARD_W * 7) / 5;
  let gridTop = 0;
  let filteredList: Creature[] = [];
  let focusedId: number | null = null;
  let rafId: number | null = null;
  let emptyEl: HTMLElement | null = null;
  let overlayEl: HTMLElement | null = null;

  function schedule() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      recompute();
    });
  }

  function computeLayout() {
    const width = gridEl.clientWidth;
    if (width === 0) return;
    cols = Math.max(1, Math.floor((width + GAP_X) / (MIN_CARD_W + GAP_X)));
    cardW = (width - (cols - 1) * GAP_X) / cols;
    cardH = (cardW * 7) / 5;
  }

  function updateGridHeight() {
    if (filteredList.length === 0) {
      gridEl.style.height = '0';
      return;
    }
    const rows = Math.ceil(filteredList.length / cols);
    gridEl.style.height = `${rows * (cardH + GAP_Y) - GAP_Y}px`;
  }

  function cardPos(i: number): { top: number; left: number } {
    return {
      top: Math.floor(i / cols) * (cardH + GAP_Y),
      left: (i % cols) * (cardW + GAP_X),
    };
  }

  function visibleRange(): [number, number] {
    const buf = 2 * (cardH + GAP_Y);
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const rowH = cardH + GAP_Y;
    const totalRows = Math.ceil(filteredList.length / cols);

    const firstRow = Math.max(0, Math.floor((sy - gridTop - buf) / rowH));
    const lastRow = Math.min(totalRows - 1, Math.floor((sy - gridTop + vh + buf) / rowH));

    const first = firstRow * cols;
    const last = Math.min(filteredList.length - 1, (lastRow + 1) * cols - 1);
    return [Math.max(0, first), last];
  }

  function acquireEntry(creature: Creature): PoolEntry {
    if (pool.length > 0) {
      const entry = pool.pop()!;
      entry.setFocused(false);
      entry.wrap.style.removeProperty('--foil-x');
      entry.wrap.style.removeProperty('--foil-y');
      entry.updateCreature(creature);
      gridEl.appendChild(entry.wrap);
      return entry;
    }
    const entry = createEntry(creature);
    gridEl.appendChild(entry.wrap);
    return entry;
  }

  function releaseEntry(entry: PoolEntry) {
    entry.setFocused(false);
    entry.wrap.classList.remove('card-wrap--enter');
    entry.wrap.style.animationDelay = '';
    entry.wrap.style.removeProperty('--foil-x');
    entry.wrap.style.removeProperty('--foil-y');
    // Clear inline transform/transition on the 3D layer so the next
    // creature starts clean (no stale rotation, correct hover transition timing).
    const card3dEl = entry.wrap.querySelector('.card-3d') as HTMLElement | null;
    if (card3dEl) {
      card3dEl.style.transform = '';
      card3dEl.style.transition = '';
    }
    if (entry.wrap.parentNode) entry.wrap.parentNode.removeChild(entry.wrap);
    pool.push(entry);
  }

  function mountAt(creature: Creature, idx: number): PoolEntry {
    const entry = acquireEntry(creature);
    const pos = cardPos(idx);
    entry.wrap.style.width = `${cardW}px`;
    entry.wrap.style.height = `${cardH}px`;
    entry.wrap.style.top = `${pos.top}px`;
    entry.wrap.style.left = `${pos.left}px`;
    entry.wrap.style.display = '';

    if (!entered.has(creature.id)) {
      const bIdx = batchIdxMap.get(creature.id) ?? 0;
      entry.wrap.style.animationDelay = `${bIdx * 0.07}s`;
      entry.wrap.classList.add('card-wrap--enter');
      entered.add(creature.id);
    }

    active.set(creature.id, entry);
    return entry;
  }

  function getOverlay(): HTMLElement {
    if (!overlayEl) {
      overlayEl = el('div', { class: 'focus-overlay' });
      overlayEl.addEventListener('click', () => setState({ focusedId: null }));
    }
    return overlayEl;
  }

  function updateOverlay() {
    const ov = getOverlay();
    if (focusedId !== null) {
      if (!document.body.contains(ov)) document.body.appendChild(ov);
    } else if (ov.parentNode) {
      ov.remove();
    }
  }

  function updateEmpty() {
    const { total } = getState();
    if (filteredList.length === 0 && creaturesMap.size > 0) {
      const subMsg =
        creaturesMap.size < total
          ? 'Scroll to load more entries'
          : 'Try a different search or type filter.';
      if (!emptyEl) {
        emptyEl = el('div', { class: 'empty' }, [
          el('div', { class: 'empty-icon' }, ['∅']),
          el('div', { class: 'empty-msg' }, ['NO ENTRIES FOUND']),
          el('div', { class: 'empty-sub' }, [subMsg]),
        ]);
        wrapper.appendChild(emptyEl);
      } else {
        const sub = emptyEl.querySelector('.empty-sub');
        if (sub) sub.textContent = subMsg;
      }
    } else if (emptyEl) {
      emptyEl.remove();
      emptyEl = null;
    }
  }

  function recompute() {
    computeLayout();
    if (gridEl.clientWidth === 0) return;

    // Read layout before any writes to avoid forced reflows mid-function
    gridTop = gridEl.getBoundingClientRect().top + window.scrollY;
    updateGridHeight();

    wrapper.classList.toggle('grid--has-focus', focusedId !== null);

    const [first, last] = visibleRange();

    const shouldBeActive = new Set<number>();
    for (let i = first; i <= last; i++) {
      if (filteredList[i]) shouldBeActive.add(filteredList[i].id);
    }
    if (focusedId !== null) shouldBeActive.add(focusedId);

    // Release cards that are no longer in the visible range
    for (const [id, entry] of active) {
      if (!shouldBeActive.has(id)) {
        active.delete(id);
        releaseEntry(entry);
      }
    }

    // Mount new cards or reposition existing non-focused cards in the visible range.
    // The focused card is positioned by CSS (position:fixed centered); inline top/left
    // would override that and push the card off-screen.
    for (let i = first; i <= last; i++) {
      const c = filteredList[i];
      if (!c) continue;

      const entry = active.get(c.id);
      if (!entry) {
        mountAt(c, i);
      } else if (c.id !== focusedId) {
        const pos = cardPos(i);
        entry.wrap.style.width = `${cardW}px`;
        entry.wrap.style.height = `${cardH}px`;
        entry.wrap.style.top = `${pos.top}px`;
        entry.wrap.style.left = `${pos.left}px`;
      }
    }

    // Keep the focused card mounted even when outside the visible range
    if (focusedId !== null && !active.has(focusedId)) {
      const creature = creaturesMap.get(focusedId);
      if (creature) {
        const idx = filteredList.findIndex((c) => c.id === focusedId);
        mountAt(creature, Math.max(0, idx));
      }
    }

    // The focused card must not have inline top/left/width/height — those would
    // override the CSS centering. Always clear them for whichever card is focused.
    if (focusedId !== null) {
      const fEntry = active.get(focusedId);
      if (fEntry) {
        fEntry.wrap.style.top = '';
        fEntry.wrap.style.left = '';
        fEntry.wrap.style.width = '';
        fEntry.wrap.style.height = '';
      }
    }

    // Sync focus state only when it actually changes (avoids interrupting the idle animation).
    // When unfocusing, restore inline positioning so the card returns to its grid slot.
    for (const [id, entry] of active) {
      const shouldBeFocused = id === focusedId;
      const isCurrFocused = entry.wrap.classList.contains('card-wrap--focused');
      if (shouldBeFocused !== isCurrFocused) {
        entry.setFocused(shouldBeFocused);
        if (!shouldBeFocused) {
          const idx = filteredList.findIndex((c) => c.id === id);
          if (idx !== -1) {
            const pos = cardPos(idx);
            entry.wrap.style.width = `${cardW}px`;
            entry.wrap.style.height = `${cardH}px`;
            entry.wrap.style.top = `${pos.top}px`;
            entry.wrap.style.left = `${pos.left}px`;
          }
        }
      }
    }

    updateOverlay();
    updateEmpty();
  }

  subscribe((state) => {
    focusedId = state.focusedId;
    const q = state.query.toLowerCase();
    filteredList = state.creatures.filter((c) => {
      const matchQ = !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
      const matchT = state.activeType === 'ALL' || c.types.includes(state.activeType);
      return matchQ && matchT;
    });
    for (const c of state.creatures) creaturesMap.set(c.id, c);
    schedule();
  });

  window.addEventListener('scroll', schedule, { passive: true });

  const ro = new ResizeObserver(schedule);
  ro.observe(gridEl);

  function addCreature(creature: Creature, idx: number) {
    creaturesMap.set(creature.id, creature);
    batchIdxMap.set(creature.id, idx);
  }

  function updateCreature(creature: Creature) {
    creaturesMap.set(creature.id, creature);
    const entry = active.get(creature.id);
    if (entry) entry.updateCreature(creature);
  }

  return { root: wrapper, addCreature, updateCreature };
}
