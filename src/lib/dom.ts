type Props<K extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[K], 'style' | 'className'>
> & {
  class?: string;
  style?: Partial<CSSStyleDeclaration>;
  on?: Partial<{ [E in keyof HTMLElementEventMap]: (e: HTMLElementEventMap[E]) => void }>;
  dataset?: Record<string, string>;
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props<K>,
  children?: (Node | string | null | undefined)[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (props) {
    const { class: className, style, on, dataset, ...rest } = props;
    if (className) node.className = className;
    if (style) Object.assign(node.style, style);
    if (on) {
      for (const [event, handler] of Object.entries(on)) {
        if (handler) node.addEventListener(event, handler as EventListener);
      }
    }
    if (dataset) {
      for (const [key, val] of Object.entries(dataset)) {
        node.dataset[key] = val;
      }
    }
    for (const [key, val] of Object.entries(rest)) {
      if (val !== undefined && val !== null) {
        (node as unknown as Record<string, unknown>)[key] = val;
      }
    }
  }

  if (children) {
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }

  return node;
}

export function setText(node: HTMLElement, text: string): void {
  node.textContent = text;
}

export function setVar(node: HTMLElement, name: string, value: string): void {
  node.style.setProperty(name, value);
}
