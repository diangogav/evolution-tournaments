import type {
  Identified,
  TournamentFormat,
  UUID,
} from "../../shared/types";
import type { MatchParticipant } from "./match-participant";

export interface MatchProps extends Identified {
  tournamentId: UUID;
  roundNumber: number;
  stage: string | null;
  bestOf: number | null;
  scheduledAt: string | null;
  completedAt: string | null;
  format: TournamentFormat | null;
  participants: [MatchParticipant, MatchParticipant];
  metadata: Record<string, unknown>;
}

export class Match implements Identified {
  private constructor(private props: MatchProps) { }

  static create(props: MatchProps): Match {
    if (!props.tournamentId) {
      throw new Error("Match.tournamentId is required");
    }

    if (!Number.isInteger(props.roundNumber) || props.roundNumber <= 0) {
      throw new Error("Match.roundNumber must be a positive integer");
    }

    if (!props.participants || props.participants.length !== 2) {
      throw new Error("Match must have exactly 2 participants");
    }

    const [p1, p2] = props.participants;

    if (!p1.participantId || !p2.participantId) {
      throw new Error("Match participants must have a participantId");
    }

    if (p1.participantId === p2.participantId) {
      throw new Error("Match participants must be different");
    }

    const normalized: MatchProps = {
      ...props,
      stage: props.stage ?? null,
      bestOf: props.bestOf ?? null,
      scheduledAt: props.scheduledAt ?? null,
      completedAt: props.completedAt ?? null,
      format: props.format ?? null,
      metadata: props.metadata ?? {},
      participants: [
        {
          participantId: p1.participantId,
          score: p1.score ?? null,
          result: p1.result ?? null,
          lineup: p1.lineup,
        },
        {
          participantId: p2.participantId,
          score: p2.score ?? null,
          result: p2.result ?? null,
          lineup: p2.lineup,
        },
      ],
    };

    return new Match(normalized);
  }

  get id() { return this.props.id; }
  get tournamentId() { return this.props.tournamentId; }
  get roundNumber() { return this.props.roundNumber; }
  get format() { return this.props.format; }
  get participants(): [MatchParticipant, MatchParticipant] { return this.props.participants; }
  get completedAt() { return this.props.completedAt; }
  get metadata() { return this.props.metadata; }

  markCompleted(timestamp: string) {
    if (this.props.completedAt) {
      throw new Error("Match already completed");
    }
    this.props.completedAt = timestamp;
  }

  updateParticipantScore(participantId: UUID, score: number) {
    if (!Number.isFinite(score) || score < 0) {
      throw new Error("Score must be a non-negative number");
    }

    const participant = this.props.participants.find(
      (p) => p.participantId === participantId
    );

    if (!participant) {
      throw new Error("Participant not found in match");
    }

    participant.score = score;
  }

  setParticipantResult(participantId: UUID, result: string) {
    const participant = this.props.participants.find(
      (p) => p.participantId === participantId
    );

    if (!participant) {
      throw new Error("Participant not found in match");
    }

    participant.result = result as any;
  }

  annullResult() {
    this.props.completedAt = null;
    this.props.participants.forEach(p => {
      p.score = null;
      p.result = null;
    });
  }

  editResult(participants: [MatchParticipant, MatchParticipant]) {
    if (!this.props.completedAt) {
      throw new Error("Cannot edit result of an incomplete match");
    }
    this.props.participants = participants;
  }

  withParticipants(participants: [MatchParticipant, MatchParticipant]): Match {
    return Match.create({
      ...this.toPrimitives(),
      participants,
    });
  }

  toPrimitives(): MatchProps {
    return {
      ...this.props,
      participants: this.props.participants.map((p) => ({ ...p })) as [
        MatchParticipant,
        MatchParticipant,
      ],
      metadata: { ...this.props.metadata },
    };
  }
}
