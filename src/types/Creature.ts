export interface Creature {
  id: number;
  name: string;
  category: string;
  types: string[];
  height: string;
  weight: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  sprite: string;
  lore: string;
  habitat: string;
  region: string;
  evo: string[];
  evoStage: number;
}
