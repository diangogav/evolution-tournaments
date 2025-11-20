export interface BracketParticipantView {
    id: string;
    displayName: string;
    score: number | null;
}

export interface BracketMatchView {
    id: string;
    roundNumber: number;
    position: number;
    nextMatchId: string | null;
    participant1?: BracketParticipantView;
    participant2?: BracketParticipantView;
    winnerId: string | null;
}

export interface BracketRoundView {
    roundNumber: number;
    matches: BracketMatchView[];
}

export interface BracketView {
    tournamentId: string;
    rounds: BracketRoundView[];
}
