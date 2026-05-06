import { el } from '../lib/dom';

export function Footer(total: number): { root: HTMLElement; updateLoaded: (n: number) => void } {
  const dot = el('span', { class: 'dex-footer-dot' });
  const status = el('span', { class: 'dex-footer-status' }, [dot, ' ONLINE']);
  const entriesSpan = el('span', {}, [`◆ ENTRIES: 0 / ${total}`]);

  const root = el('footer', { class: 'dex-footer' }, [
    entriesSpan,
    el('span', {}, ['◆ REGION: KANTO']),
    el('span', {}, ['◆ TRAINER LV. 24']),
    status,
  ]);

  function updateLoaded(n: number) {
    entriesSpan.textContent = `◆ ENTRIES: ${n} / ${total}`;
  }

  return { root, updateLoaded };
}
