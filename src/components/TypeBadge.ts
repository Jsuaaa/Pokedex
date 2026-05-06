import { el } from '../lib/dom';
import { getTypeInfo } from '../lib/typeInfo';

export function TypeBadge(type: string, size: 'sm' | 'lg' = 'sm'): HTMLElement {
  const info = getTypeInfo(type);
  const badge = el('span', {
    class: `type-badge type-badge--${size}`,
    style: {
      background: info.bg,
      color: info.fg,
      boxShadow:
        'inset -2px -2px 0 rgba(0,0,0,0.25), inset 2px 2px 0 rgba(255,255,255,0.25)',
    },
  });
  badge.textContent = info.label;
  return badge;
}
