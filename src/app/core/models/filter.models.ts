import { Banlist } from "../enums/banlist.enum";

export interface Filter {
  types?: string;
  attributes?: string;
  races?: string;
  level?: string;
  archetypes?: string;
  banlistOption?: Banlist;
}
