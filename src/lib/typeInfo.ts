export interface TypeInfo {
  label: string;
  bg: string;
  fg: string;
  glow: string;
}

export const TYPE_INFO: Record<string, TypeInfo> = {
  fire: { label: 'FIRE', bg: '#e85d3a', fg: '#2a0e08', glow: '#ffb38a' },
  water: { label: 'WATER', bg: '#3a8de8', fg: '#06182f', glow: '#9ec8f5' },
  grass: { label: 'GRASS', bg: '#5cb84a', fg: '#0c2308', glow: '#bde6a4' },
  electric: { label: 'ELECTRIC', bg: '#f0c419', fg: '#2c2304', glow: '#fbe98a' },
  rock: { label: 'ROCK', bg: '#a78c4a', fg: '#231a06', glow: '#d8c389' },
  ground: { label: 'GROUND', bg: '#c89a5b', fg: '#2b1d08', glow: '#e7c799' },
  ghost: { label: 'GHOST', bg: '#6b4a9a', fg: '#1a0e2b', glow: '#b69ed6' },
  psychic: { label: 'PSYCHIC', bg: '#e94a7e', fg: '#2c0814', glow: '#f5a3bd' },
  ice: { label: 'ICE', bg: '#7fcfd8', fg: '#0a2326', glow: '#c5ecf0' },
  dragon: { label: 'DRAGON', bg: '#5c4ad8', fg: '#0e0a2c', glow: '#a39bef' },
  normal: { label: 'NORMAL', bg: '#a0a060', fg: '#1a1a08', glow: '#d0d098' },
  fighting: { label: 'FIGHT', bg: '#c03028', fg: '#2a0808', glow: '#f08070' },
  flying: { label: 'FLYING', bg: '#a890f0', fg: '#1a1040', glow: '#c8b8ff' },
  poison: { label: 'POISON', bg: '#a040a0', fg: '#200020', glow: '#d070d0' },
  bug: { label: 'BUG', bg: '#a8b820', fg: '#1c2004', glow: '#d0e060' },
  steel: { label: 'STEEL', bg: '#b8b8d0', fg: '#202030', glow: '#e0e0f0' },
  dark: { label: 'DARK', bg: '#705848', fg: '#18100c', glow: '#a88060' },
  fairy: { label: 'FAIRY', bg: '#ee99ac', fg: '#2c1018', glow: '#ffccd8' },
};

export function getTypeInfo(type: string): TypeInfo {
  return (
    TYPE_INFO[type] ?? { label: type.toUpperCase(), bg: '#555', fg: '#fff', glow: '#888' }
  );
}
