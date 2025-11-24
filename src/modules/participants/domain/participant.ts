import type { Identified, ParticipantType, UUID } from "../../shared/types";

export interface ParticipantProps extends Identified {
  type: ParticipantType;
  referenceId: UUID;
  displayName: string;
  countryCode?: string | null;
  seeding?: number | null;
  metadata: unknown;
}

export type CreateParticipantProps = Omit<ParticipantProps, "createdAt" | "updatedAt">;

export class Participant implements Identified {
  private constructor(private props: ParticipantProps) { }

  static create(props: CreateParticipantProps): Participant {
    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new Error("Participant.displayName cannot be empty");
    }

    if (props.seeding !== undefined && props.seeding !== null) {
      if (props.seeding <= 0) {
        throw new Error("Participant.seeding must be > 0");
      }
    }

    return new Participant({
      ...props,
      metadata: props.metadata ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPrimitives(props: ParticipantProps): Participant {
    return new Participant(props);
  }

  get id() { return this.props.id; }
  get type() { return this.props.type; }
  get referenceId() { return this.props.referenceId; }
  get displayName() { return this.props.displayName; }
  get metadata() { return this.props.metadata; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toPrimitives() { return { ...this.props }; }
}
