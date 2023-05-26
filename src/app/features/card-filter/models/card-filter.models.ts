export interface CardFilter {
  types?: string[];
  attributes?: string[];
  races?: string[];
  level?: string[];
  archetypes?: string[];
  banlistOption?: string[];
}

export interface Archetype {
  archetype_name: string
}

export type FiltersCard = 'types' | 'attributes' | 'races' | 'level' | 'archetypes' | 'banlistOption';
