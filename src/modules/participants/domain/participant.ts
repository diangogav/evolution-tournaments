import type { Identified, ParticipantType, UUID } from "../../shared/types";

export interface ParticipantProps extends Identified {
  type: ParticipantType;
  referenceId: UUID;
  displayName: string;
  countryCode?: string | null;
  seeding?: number | null;
  metadata: unknown;
}

export class Participant implements Identified {
  private constructor(private props: ParticipantProps) {}

  static create(props: ParticipantProps): Participant {
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
    });
  }

  get id() { return this.props.id; }
  get type() { return this.props.type; }
  get referenceId() { return this.props.referenceId; }

  toPrimitives() { return { ...this.props }; }
}
