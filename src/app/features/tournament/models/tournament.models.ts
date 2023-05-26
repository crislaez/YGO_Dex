export interface TournamentResponse {
  archetypes?: TournamentDeck[],
  format?: string;
  dateCutoffStart?: string;
  dateCutoffEnd?: string;
  tierCutoff?: string;
  total?: number;
}

export interface TournamentDeck {
  arch_1?: string;
  quantity?: number;
  arch_1_img?: number;
}

export type TournamentDateOption = 'Format' | 'Banlist' | '1' | '2' | '3' | '6' | '12';
