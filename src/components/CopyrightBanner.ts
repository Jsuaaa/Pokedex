import { el } from '../lib/dom';

export function CopyrightBanner(): { root: HTMLElement } {
  const root = el('div', { class: 'copyright-banner' }, [
    '♪ Música deshabilitada en producción por motivos de copyright',
  ]);
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  return { root };
}
