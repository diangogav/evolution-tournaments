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

export class Team implements Identified {
  private constructor(private props: TeamProps) {}

  static create(props: TeamProps): Team {
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
    });
  }

  get id() { return this.props.id; }
  get displayName() { return this.props.displayName; }
  get minMembers() { return this.props.minMembers; }
  get maxMembers() { return this.props.maxMembers; }

  deactivate() { this.props.isActive = false; }
  activate() { this.props.isActive = true; }

  toPrimitives() { return { ...this.props }; }
}
