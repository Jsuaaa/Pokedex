import { el } from '../lib/dom';
import { setState } from '../state/store';

export function SearchBar(): HTMLElement {
  const input = el('input', {
    class: 'search',
    placeholder: 'SEARCH BY NAME...',
  }) as HTMLInputElement;

  const clearBtn = el('button', { class: 'search-clear' }, ['×']);
  clearBtn.style.display = 'none';

  input.addEventListener('input', () => {
    const q = input.value;
    setState({ query: q });
    clearBtn.style.display = q ? 'block' : 'none';
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    setState({ query: '' });
    clearBtn.style.display = 'none';
    input.focus();
  });

  const wrap = el('div', { class: 'search-wrap' }, [
    el('span', { class: 'search-icon' }, ['⌕']),
    input,
    clearBtn,
  ]);

  return wrap;
}
