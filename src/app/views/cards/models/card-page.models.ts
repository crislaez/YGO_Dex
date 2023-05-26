import { Filter } from "@ygodex/core/models/filter.models";

export interface CardsPageState {
  slice?: number;
  search?: string;
  reload?: boolean
  filters?: Filter;
}
