import { el } from '../lib/dom';

export function Stat(label: string, value: number, max = 120): HTMLElement {
  const pct = Math.min(100, Math.round((value / max) * 100));

  const fill = el('div', { class: 'stat-bar-fill' });
  fill.style.width = pct + '%';

  return el('div', { class: 'stat' }, [
    el('span', { class: 'stat-label' }, [label]),
    el('div', { class: 'stat-bar' }, [fill]),
    el('span', { class: 'stat-value' }, [String(value)]),
  ]);
}
