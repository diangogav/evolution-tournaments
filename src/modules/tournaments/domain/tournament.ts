import type {
  Identified,
  ParticipantType,
  TournamentFormat,
  TournamentStatus,
} from "../../shared/types";

export interface TournamentProps extends Identified {
  name: string;
  description?: string | null;
  discipline: string;
  format: TournamentFormat;
  status: TournamentStatus;
  allowMixedParticipants: boolean;
  participantType?: ParticipantType | null;
  maxParticipants?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  location?: string | null;
  webhookUrl?: string | null;
  metadata: unknown;
}

export class Tournament implements Identified {
  private constructor(private props: TournamentProps) { }

  static create(props: TournamentProps): Tournament {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Tournament.name cannot be empty");
    }

    if (!props.discipline || props.discipline.trim().length === 0) {
      throw new Error("Tournament.discipline cannot be empty");
    }

    if (!props.allowMixedParticipants && !props.participantType) {
      throw new Error(
        "participantType is required when mixed participants are disabled"
      );
    }

    if (props.startAt && props.endAt && props.startAt > props.endAt) {
      throw new Error("Tournament.startAt must be before endAt");
    }
    return new Tournament({
      ...props,
      webhookUrl: props.webhookUrl ?? null,
      metadata: props.metadata ?? {},
    });
  }

  get id() { return this.props.id; }
  get format() { return this.props.format; }
  get status() { return this.props.status; }
  get allowMixedParticipants() { return this.props.allowMixedParticipants; }
  get participantType() { return this.props.participantType; }
  get maxParticipants() { return this.props.maxParticipants ?? null; }
  get webhookUrl() { return this.props.webhookUrl; }

  // State transition methods
  publish(): void {
    if (this.props.status !== "DRAFT") {
      throw new Error("Can only publish tournaments in DRAFT status");
    }
    this.props.status = "PUBLISHED";
  }

  start(): void {
    if (this.props.status !== "PUBLISHED") {
      throw new Error("Can only start tournaments in PUBLISHED status");
    }
    this.props.status = "STARTED";
  }

  complete(): void {
    if (this.props.status !== "STARTED") {
      throw new Error("Can only complete tournaments in STARTED status");
    }
    this.props.status = "COMPLETED";
  }

  cancel(): void {
    if (this.props.status === "COMPLETED") {
      throw new Error("Cannot cancel a completed tournament");
    }
    this.props.status = "CANCELLED";
  }

  // Validation methods
  canEnroll(): boolean {
    return this.props.status === "PUBLISHED";
  }

  canWithdraw(): boolean {
    return this.props.status === "PUBLISHED";
  }

  canGenerateBracket(): boolean {
    return this.props.status === "PUBLISHED";
  }

  canStartMatches(): boolean {
    return this.props.status === "STARTED";
  }

  toPrimitives() {
    return { ...this.props };
  }
}
