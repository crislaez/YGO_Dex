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


export interface CardFilterResponse {
  MONSTER: Monster;
  SKILL:   Skill;
  SPELL:   Skill;
  TRAP:    Skill;
  types:   Type[];
 }

 export interface Monster {
  attributes:  string[];
  level:       number[];
  linkmarkers: string[];
  race:        string[];
  type:        string[];
 }

 export interface Skill {
  race: string[];
  type: string[];
 }

 export interface Type {
  area:      Area[];
  group:     Group;
  name:      string;
  sortGroup: number;
 }

 export enum Area {
  Extra = "EXTRA",
  Main = "MAIN",
  Side = "SIDE",
 }

 export enum Group {
  Monster = "MONSTER",
  Skill = "SKILL",
  Spell = "SPELL",
  Trap = "TRAP",
 }
