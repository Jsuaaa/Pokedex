import { el } from '../lib/dom';
import { Creature } from '../types/Creature';
import { getTypeInfo } from '../lib/typeInfo';
import { TypeBadge } from './TypeBadge';

export function CardFront(creature: Creature): HTMLElement {
  const primaryType = creature.types[0] ?? 'normal';
  const typeInfo = getTypeInfo(primaryType);

  const face = el('div', {
    class: 'card-face card-face--front',
    style: {
      '--type-bg': typeInfo.bg,
      '--type-glow': typeInfo.glow,
    } as unknown as Partial<CSSStyleDeclaration>,
  });

  const header = el('div', { class: 'card-header' }, [
    el('span', { class: 'card-num' }, [`№ ${String(creature.id).padStart(3, '0')}`]),
    el('span', { class: 'card-name' }, [creature.name.toUpperCase()]),
  ]);

  const portraitBg = el('div', { class: 'card-portrait-bg' });
  const sprite = el('img', { class: 'card-sprite', loading: 'lazy', decoding: 'async' });
  (sprite as HTMLImageElement).src = creature.sprite;
  (sprite as HTMLImageElement).alt = creature.name;
  const portraitFrame = el('div', { class: 'card-portrait-frame' });
  const portrait = el('div', { class: 'card-portrait' }, [portraitBg, sprite, portraitFrame]);

  const typeBadges = creature.types.map((t) => TypeBadge(t));
  const meta = el('div', { class: 'card-meta' }, [
    el('span', { class: 'card-category' }, [creature.category]),
    el('div', { class: 'card-types' }, typeBadges),
  ]);

  const flavor = el('div', { class: 'card-flavor' }, [`"${creature.lore}"`]);
  const foil = el('div', { class: 'foil' });

  face.append(header, portrait, meta, flavor, foil);
  return face;
}
