import { el } from '../lib/dom';

export function DexShell(
  filtered: number,
  total: number,
): { root: HTMLElement; updateCounter: (f: number, t: number) => void } {
  const sub = el('div', { class: 'dex-sub' }, [
    `${filtered} / ${total} ENTRIES INDEXED`,
  ]);

  const shellFrame = el('div', { class: 'dex-shell-frame' }, [
    el('div', { class: 'dex-led-cluster' }, [
      el('div', { class: 'dex-led dex-led--big' }),
      el('div', { class: 'dex-led dex-led--sm dex-led--red' }),
      el('div', { class: 'dex-led dex-led--sm dex-led--yellow' }),
      el('div', { class: 'dex-led dex-led--sm dex-led--green' }),
    ]),
    el('div', { class: 'dex-title-block' }, [
      el('div', { class: 'dex-eyebrow' }, ['FIELD GUIDE  ·  v3.20']),
      el('h1', { class: 'dex-title' }, ['POKÉDEX']),
      sub,
    ]),
    el('div', { class: 'dex-corner-bolts' }, [
      el('span'),
      el('span'),
      el('span'),
      el('span'),
    ]),
  ]);

  const root = el('header', { class: 'dex-shell' }, [shellFrame]);

  function updateCounter(f: number, t: number) {
    sub.textContent = `${f} / ${t} ENTRIES INDEXED`;
  }

  return { root, updateCounter };
}
