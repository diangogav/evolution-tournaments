import type { IdGenerator } from "../../shared/ports";
import type { Team } from "../domain/team";
import type { TeamRepository } from "../domain/team.repository";

export class CreateTeamUseCase {
  constructor(
    private readonly teams: TeamRepository,
    private readonly ids: IdGenerator
  ) {}

  execute(input: {
    displayName: string;
    shortCode?: string;
    logoUrl?: string;
    managerName?: string;
    minMembers: number;
    maxMembers: number;
    countryCode?: string;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }): Team {
    if (input.maxMembers < input.minMembers) {
      throw new Error("maxMembers must be greater than or equal to minMembers");
    }

    const team: Team = {
      id: this.ids.generate(),
      displayName: input.displayName,
      shortCode: input.shortCode,
      logoUrl: input.logoUrl,
      managerName: input.managerName,
      minMembers: input.minMembers,
      maxMembers: input.maxMembers,
      countryCode: input.countryCode,
      isActive: input.isActive ?? true,
      metadata: input.metadata,
    };

    return this.teams.create(team);
  }
}

