import type {
  Identified,
  TournamentEntryStatus,
  UUID,
} from "../../shared/types";

export interface TournamentEntryProps extends Identified {
  tournamentId: UUID;
  participantId: UUID;
  status: TournamentEntryStatus;
  groupId?: UUID | null;
  seed?: number | null;
  metadata: unknown;
}

export class TournamentEntry implements Identified {
  private constructor(private props: TournamentEntryProps) { }

  static create(props: TournamentEntryProps): TournamentEntry {
    if (props.seed !== undefined && props.seed !== null && props.seed <= 0) {
      throw new Error("TournamentEntry.seed must be > 0");
    }

    return new TournamentEntry({
      ...props,
      metadata: props.metadata ?? {},
    });
  }

  get id() { return this.props.id; }
  get tournamentId() { return this.props.tournamentId; }
  get participantId() { return this.props.participantId; }
  get seed() { return this.props.seed ?? null; }
  get status() { return this.props.status; }

  toPrimitives() {
    return { ...this.props };
  }

  withdraw() {
    if (this.props.status !== "PENDING" && this.props.status !== "CONFIRMED") {
      throw new Error("Cannot withdraw from tournament unless status is PENDING or CONFIRMED");
    }
    this.props.status = "WITHDRAWN";
  }
}
