import { TournamentDateOption } from "@ygodex/features/tournament/models/tournament.models";

export interface TournamentPageState {
  dateOption?: TournamentDateOption;
  slice: number;
  reload?: boolean;
}
