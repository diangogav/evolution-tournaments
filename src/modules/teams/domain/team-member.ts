import type { Identified, UUID } from "../../shared/types";

export interface TeamMemberProps extends Identified {
  teamId: UUID;
  playerId: UUID;
  role?: string | null;
  isCaptain: boolean;
  joinedAt: string;
  leftAt?: string | null;
}

export type CreateTeamMemberProps = Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>;

export class TeamMember implements Identified {
  private constructor(private props: TeamMemberProps) { }

  static create(props: CreateTeamMemberProps): TeamMember {
    return new TeamMember({
      ...props,
      role: props.role ?? null,
      isCaptain: props.isCaptain ?? false,
      leftAt: props.leftAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPrimitives(props: TeamMemberProps): TeamMember {
    return new TeamMember(props);
  }

  get id() { return this.props.id; }
  get teamId() { return this.props.teamId; }
  get playerId() { return this.props.playerId; }
  get isCaptain() { return this.props.isCaptain }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toPrimitives() { return { ...this.props }; }
}
