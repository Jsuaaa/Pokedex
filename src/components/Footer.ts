import { el } from '../lib/dom';

export function Footer(total: number): HTMLElement {
  const dot = el('span', { class: 'dex-footer-dot' });
  const status = el('span', { class: 'dex-footer-status' }, [dot, ' ONLINE']);

  return el('footer', { class: 'dex-footer' }, [
    el('span', {}, [`◆ ENTRIES: ${total}`]),
    el('span', {}, ['◆ REGION: KANTO']),
    el('span', {}, ['◆ TRAINER LV. 24']),
    status,
  ]);
}
