export interface BracketParticipantView {
    id: string;
    displayName: string;
    score: number | null;
}

export interface BracketMatchView {
    id: string;
    roundNumber: number;
    position: number;
    slotId: string; // "R1-P3"
    nextMatchId: string | null;
    next: { round: number; position: number } | null;
    from: { round: number; position: number }[];
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
