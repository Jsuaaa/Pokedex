import { el } from '../lib/dom';

export function CopyrightBanner(): { root: HTMLElement } {
  const root = el('div', { class: 'copyright-banner' }, [
    '♪ Music disabled in production for copyright reasons',
  ]);
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  return { root };
}
