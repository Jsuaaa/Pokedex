import { el } from '../lib/dom';
import { getTypeInfo } from '../lib/typeInfo';
import { getState, setState, subscribe } from '../state/store';

export function TypeFilters(): { root: HTMLElement; updateTypes: (types: string[]) => void } {
  const container = el('div', { class: 'type-filters' });
  let currentTypes: string[] = [];

  function renderPills(types: string[]) {
    container.innerHTML = '';
    const allPill = el('button', {
      class: `type-pill type-pill--all${getState().activeType === 'ALL' ? ' type-pill--active' : ''}`,
    }, ['ALL']);
    allPill.addEventListener('click', () => setState({ activeType: 'ALL' }));
    container.appendChild(allPill);

    for (const t of types) {
      const info = getTypeInfo(t);
      const isActive = getState().activeType === t;
      const pill = el('button', {
        class: `type-pill${isActive ? ' type-pill--active' : ''}`,
        style: {
          '--pill-bg': info.bg,
          '--pill-fg': info.fg,
          '--pill-glow': info.glow,
        } as unknown as Partial<CSSStyleDeclaration>,
      }, [info.label]);
      pill.addEventListener('click', () => setState({ activeType: t }));
      container.appendChild(pill);
    }
  }

  subscribe((state) => {
    container.querySelectorAll('.type-pill').forEach((pill) => {
      const t = (pill as HTMLElement).dataset.type;
      const isActive = t ? state.activeType === t : state.activeType === 'ALL';
      pill.classList.toggle('type-pill--active', isActive);
    });

    container.querySelectorAll('.type-pill').forEach((pill, i) => {
      if (i === 0) {
        pill.classList.toggle('type-pill--active', state.activeType === 'ALL');
      }
    });

    renderPills(currentTypes);
  });

  function updateTypes(types: string[]) {
    if (types.join(',') !== currentTypes.join(',')) {
      currentTypes = types;
      renderPills(types);
    }
  }

  return { root: container, updateTypes };
}
