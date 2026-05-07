import { el } from '../lib/dom';

export interface StartOverlayParams {
  onStart: () => void;
  onSkip?: () => void;
}

export function StartOverlay({ onStart, onSkip }: StartOverlayParams): {
  root: HTMLElement;
  dismiss: () => void;
} {
  let dismissed = false;

  const title = el('div', { class: 'start-overlay-title' }, ['PRESS START']);
  const sub = el('div', { class: 'start-overlay-sub' }, [
    'CLICK ANYWHERE TO BEGIN',
  ]);
  const skipBtn = el(
    'button',
    {
      class: 'start-overlay-skip',
      type: 'button',
      on: {
        click: (e) => {
          e.stopPropagation();
          if (onSkip) onSkip();
          dismiss();
        },
      },
    },
    ['CONTINUE WITHOUT MUSIC'],
  );

  const root = el(
    'div',
    {
      class: 'start-overlay',
      role: 'dialog',
      ariaLabel: 'Press start to begin',
      on: {
        click: () => {
          if (dismissed) return;
          onStart();
          dismiss();
        },
      },
    },
    [title, sub, skipBtn],
  );

  const keyHandler = (e: KeyboardEvent) => {
    if (dismissed) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStart();
      dismiss();
    }
  };
  window.addEventListener('keydown', keyHandler);

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    window.removeEventListener('keydown', keyHandler);
    root.classList.add('start-overlay--leaving');
    setTimeout(() => {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 350);
  }

  return { root, dismiss };
}
