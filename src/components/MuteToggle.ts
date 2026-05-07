import { el } from '../lib/dom';
import {
  isMusicMuted,
  toggleMusicMute,
  onMusicMuteChange,
} from '../lib/audio';

export function MuteToggle(): { root: HTMLElement } {
  const button = el('button', {
    class: 'mute-toggle',
    type: 'button',
    title: 'Toggle music',
    ariaLabel: 'Toggle music',
    on: {
      click: () => {
        toggleMusicMute();
      },
    },
  });

  function render(muted: boolean) {
    button.textContent = muted ? '♪ OFF' : '♪ ON';
    button.classList.toggle('mute-toggle--muted', muted);
    button.setAttribute('aria-pressed', muted ? 'true' : 'false');
  }

  render(isMusicMuted());
  onMusicMuteChange(render);

  return { root: button };
}
