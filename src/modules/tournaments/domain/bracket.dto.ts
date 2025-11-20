export interface BracketMatchView {
    id: string;
    roundNumber: number;
    position: number;
    nextMatchId: string | null;
    participant1?: {
        id: string;
        displayName: string;
        score: number | null;
    };
    participant2?: {
        id: string;
        displayName: string;
        score: number | null;
    };
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
