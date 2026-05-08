import { Creature } from '../types/Creature';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { playFlipSound } from '../lib/audio';
import { el } from '../lib/dom';

interface DragState {
  active: boolean;
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
  moved: boolean;
  vx: number;
  vy: number;
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function Card3D(
  creature: Creature,
  idx: number,
  onFocus: () => void,
  onBlur: () => void,
  isFocused: () => boolean,
): { wrap: HTMLElement; setFocused: (f: boolean) => void; updateCreature: (c: Creature) => void } {
  let rot = { x: 0, y: 0 };
  let inertiaId: number | null = null;

  const dragState: DragState = {
    active: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    moved: false,
    vx: 0,
    vy: 0,
  };

  const wrap = el('div', { class: 'card-wrap' });
  wrap.style.animationDelay = `${idx * 0.07}s`;

  const card3d = el('div', { class: 'card-3d' });

  let frontFace = CardFront(creature);
  let backFace = CardBack(creature);

  const edgeTop = el('div', { class: 'card-edge card-edge--top' });
  const edgeBottom = el('div', { class: 'card-edge card-edge--bottom' });
  const edgeLeft = el('div', { class: 'card-edge card-edge--left' });
  const edgeRight = el('div', { class: 'card-edge card-edge--right' });

  card3d.append(frontFace, backFace, edgeTop, edgeBottom, edgeLeft, edgeRight);
  wrap.appendChild(card3d);

  let hintEl: HTMLElement | null = null;

  function stopInertia() {
    if (inertiaId !== null) {
      cancelAnimationFrame(inertiaId);
      inertiaId = null;
    }
  }

  function startInertia() {
    stopInertia();
    const tick = () => {
      dragState.vx *= 0.94;
      dragState.vy *= 0.94;
      if (Math.abs(dragState.vx) < 0.05 && Math.abs(dragState.vy) < 0.05) {
        inertiaId = null;
        return;
      }
      rot.x = clamp(rot.x + dragState.vy, -180, 180);
      rot.y = rot.y + dragState.vx;
      applyTransform();
      inertiaId = requestAnimationFrame(tick);
    };
    inertiaId = requestAnimationFrame(tick);
  }

  function applyTransform(transition = false) {
    card3d.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
    card3d.style.transition = transition ? 'transform 0.45s cubic-bezier(.2,.9,.3,1.2)' : 'none';
  }

  function getYMod() {
    return ((rot.y % 360) + 360) % 360;
  }

  function updateHint() {
    if (!isFocused()) {
      if (hintEl) { hintEl.remove(); hintEl = null; }
      return;
    }
    const yMod = getYMod();
    const showingBack = yMod > 90 && yMod < 270;
    const text = showingBack
      ? 'DRAG TO ROTATE  •  CLICK TO FLIP BACK'
      : 'DRAG TO ROTATE  •  CLICK TO FLIP';

    if (!hintEl) {
      hintEl = el('div', { class: 'card-hint' });
      wrap.appendChild(hintEl);
    }
    hintEl.textContent = text;
  }

  function updateFoil(clientX: number, clientY: number) {
    const rect = card3d.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return;
    }
    const foilX = ((clientX - rect.left) / rect.width) * 100;
    const foilY = ((clientY - rect.top) / rect.height) * 100;
    wrap.style.setProperty('--foil-x', foilX + '%');
    wrap.style.setProperty('--foil-y', foilY + '%');
  }

  const onWindowPointerMove = (e: PointerEvent) => {
    if (!dragState.active) return;
    const dx = e.clientX - dragState.lastX;
    const dy = e.clientY - dragState.lastY;
    dragState.lastX = e.clientX;
    dragState.lastY = e.clientY;
    dragState.vx = dx * 0.5;
    dragState.vy = -dy * 0.5;

    if (
      Math.abs(e.clientX - dragState.startX) > 4 ||
      Math.abs(e.clientY - dragState.startY) > 4
    ) {
      dragState.moved = true;
    }

    rot.x = clamp(rot.x - dy * 0.5, -180, 180);
    rot.y = rot.y + dx * 0.5;
    applyTransform();
    updateHint();
    updateFoil(e.clientX, e.clientY);
  };

  const onWindowPointerUp = () => {
    if (!dragState.active) return;
    dragState.active = false;
    wrap.classList.remove('card-wrap--dragging');
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerUp);
    startInertia();
  };

  card3d.addEventListener('pointerdown', (e: PointerEvent) => {
    if (!isFocused()) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    stopInertia();
    Object.assign(dragState, {
      active: true,
      lastX: e.clientX,
      lastY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      vx: 0,
      vy: 0,
    });
    wrap.classList.add('card-wrap--dragging');
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
  });

  card3d.addEventListener('pointermove', (e: PointerEvent) => {
    if (dragState.active) return;
    updateFoil(e.clientX, e.clientY);
  });

  card3d.addEventListener('click', (e: MouseEvent) => {
    if (dragState.moved) {
      e.stopPropagation();
      dragState.moved = false;
      return;
    }
    if (!isFocused()) {
      onFocus();
    } else {
      rot.y += 180;
      applyTransform(true);
      playFlipSound();
      updateHint();
    }
  });

  function setFocused(focused: boolean) {
    if (focused) {
      wrap.classList.add('card-wrap--focused');
      updateHint();
    } else {
      wrap.classList.remove('card-wrap--focused');
      stopInertia();
      rot = { x: 0, y: 0 };
      applyTransform(true);
      if (hintEl) { hintEl.remove(); hintEl = null; }
    }
  }

  function updateCreature(c: Creature) {
    const newFront = CardFront(c);
    const newBack = CardBack(c);
    card3d.replaceChild(newFront, frontFace);
    card3d.replaceChild(newBack, backFace);
    frontFace = newFront;
    backFace = newBack;
  }

  return { wrap, setFocused, updateCreature };
}
