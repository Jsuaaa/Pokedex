import { el } from '../lib/dom';
import { Creature } from '../types/Creature';
import { getTypeInfo } from '../lib/typeInfo';
import { Stat } from './Stat';

export function CardBack(creature: Creature): HTMLElement {
  const primaryType = creature.types[0] ?? 'normal';
  const typeInfo = getTypeInfo(primaryType);

  const face = el('div', {
    class: 'card-face card-face--back',
    style: {
      '--type-bg': typeInfo.bg,
      '--type-glow': typeInfo.glow,
    } as unknown as Partial<CSSStyleDeclaration>,
  });

  const header = el('div', { class: 'card-header card-header--back' }, [
    el('span', { class: 'card-num' }, [`№ ${String(creature.id).padStart(3, '0')}`]),
    el('span', { class: 'card-name' }, [creature.name.toUpperCase()]),
  ]);

  const dataSection = el('div', { class: 'back-section' }, [
    el('div', { class: 'back-section-title' }, ['▸ DATA']),
    el('div', { class: 'data-row' }, [
      el('span', {}, ['HEIGHT']),
      el('b', {}, [creature.height]),
    ]),
    el('div', { class: 'data-row' }, [
      el('span', {}, ['WEIGHT']),
      el('b', {}, [creature.weight]),
    ]),
    el('div', { class: 'data-row' }, [
      el('span', {}, ['CLASS']),
      el('b', {}, [creature.category]),
    ]),
  ]);

  const statsSection = el('div', { class: 'back-section' }, [
    el('div', { class: 'back-section-title' }, ['▸ STATS']),
    Stat('HP ', creature.hp),
    Stat('ATK', creature.atk),
    Stat('DEF', creature.def),
    Stat('SPD', creature.spd),
  ]);

  const habitatSection = el('div', { class: 'back-section' }, [
    el('div', { class: 'back-section-title' }, ['▸ HABITAT']),
    el('div', { class: 'habitat-row' }, [
      el('span', { class: 'habitat-icon' }, ['⌂']),
      el('div', {}, [
        el('div', { class: 'habitat-name' }, [creature.habitat]),
        el('div', { class: 'habitat-region' }, [creature.region]),
      ]),
    ]),
  ]);

  const evoNodes: Node[] = [];
  creature.evo.forEach((name, i) => {
    if (i > 0) {
      const arrow = el('span', { class: 'evo-arrow' }, ['▶']);
      evoNodes.push(arrow);
    }
    const step = el(
      'span',
      { class: `evo-step${i === creature.evoStage ? ' evo-step--current' : ''}` },
      [name.toUpperCase()],
    );
    evoNodes.push(step);
  });

  const evoSection = el('div', { class: 'back-section back-section--evo' }, [
    el('div', { class: 'back-section-title' }, ['▸ EVOLUTION CHAIN']),
    el('div', { class: 'evo-chain' }, evoNodes),
  ]);

  const backGrid = el('div', { class: 'back-grid' }, [
    dataSection,
    statsSection,
    habitatSection,
    evoSection,
  ]);

  const foil = el('div', { class: 'foil' });

  face.append(header, backGrid, foil);
  return face;
}
