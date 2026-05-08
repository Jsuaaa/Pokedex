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

  const overlayChildren: (HTMLElement | string)[] = [title, sub];
  if (onSkip) {
    const skip = onSkip;
    const skipBtn = el(
      'button',
      {
        class: 'start-overlay-skip',
        type: 'button',
        on: {
          click: (e) => {
            e.stopPropagation();
            skip();
            dismiss();
          },
        },
      },
      ['CONTINUE WITHOUT MUSIC'],
    );
    overlayChildren.push(skipBtn);
  }

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
    overlayChildren,
  );

  const prevBodyOverflow = document.body.style.overflow;
  const prevHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

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
    document.body.style.overflow = prevBodyOverflow;
    document.documentElement.style.overflow = prevHtmlOverflow;
    root.classList.add('start-overlay--leaving');
    setTimeout(() => {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 350);
  }

  return { root, dismiss };
}
