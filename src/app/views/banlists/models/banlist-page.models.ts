import { Banlist } from "@ygodex/app/core/enums/banlist.enum";

export interface BanlistPageState {
  banlistType?: 'ocg' | 'tcg',
  slice?: number;
  search?: string;
  reload?: boolean;
  banlistOption?: Banlist;
}
