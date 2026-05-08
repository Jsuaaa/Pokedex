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

  const scrollY = window.scrollY;
  const body = document.body;
  const prev = {
    bodyOverflow: body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyOverscroll: body.style.overscrollBehavior,
  };
  body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overscrollBehavior = 'none';

  const updateOverlayHeight = () => {
    const vv = window.visualViewport;
    if (vv) root.style.height = `${vv.height}px`;
  };
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateOverlayHeight);
    window.visualViewport.addEventListener('scroll', updateOverlayHeight);
    updateOverlayHeight();
  }

  const blockTouchMove = (e: TouchEvent) => {
    e.preventDefault();
  };
  root.addEventListener('touchmove', blockTouchMove, { passive: false });

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
    root.removeEventListener('touchmove', blockTouchMove);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateOverlayHeight);
      window.visualViewport.removeEventListener('scroll', updateOverlayHeight);
    }
    body.style.overflow = prev.bodyOverflow;
    document.documentElement.style.overflow = prev.htmlOverflow;
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.left = prev.bodyLeft;
    body.style.right = prev.bodyRight;
    body.style.width = prev.bodyWidth;
    body.style.overscrollBehavior = prev.bodyOverscroll;
    window.scrollTo(0, scrollY);
    root.classList.add('start-overlay--leaving');
    setTimeout(() => {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 350);
  }

  return { root, dismiss };
}
