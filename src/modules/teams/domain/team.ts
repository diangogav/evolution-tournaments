import type { Identified } from "../../shared/types";

export interface TeamProps extends Identified {
  displayName: string;
  shortCode?: string | null;
  logoUrl?: string | null;
  managerName?: string | null;
  minMembers: number;
  maxMembers: number;
  countryCode?: string | null;
  isActive: boolean;
  metadata: unknown;
}

export type CreateTeamProps = Omit<TeamProps, 'createdAt' | 'updatedAt'>;

export class Team implements Identified {
  private constructor(private props: TeamProps) { }

  static create(props: CreateTeamProps): Team {
    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new Error("Team.displayName cannot be empty");
    }

    if (props.maxMembers < props.minMembers) {
      throw new Error("maxMembers must be >= minMembers");
    }

    return new Team({
      ...props,
      metadata: props.metadata ?? {},
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPrimitives(props: TeamProps): Team {
    return new Team(props);
  }

  get id() { return this.props.id; }
  get displayName() { return this.props.displayName; }
  get minMembers() { return this.props.minMembers; }
  get maxMembers() { return this.props.maxMembers; }
  get metadata() { return this.props.metadata; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  deactivate() { this.props.isActive = false; }
  activate() { this.props.isActive = true; }

  toPrimitives() { return { ...this.props }; }
}
