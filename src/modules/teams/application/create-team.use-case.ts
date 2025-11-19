import type { IdGenerator } from "../../shared/ports";
import { Team } from "../domain/team";
import type { TeamRepository } from "../domain/team.repository";

export class CreateTeamUseCase {
  constructor(
    private readonly teams: TeamRepository,
    private readonly ids: IdGenerator
  ) {}

  async execute(input: {
    displayName: string;
    shortCode?: string;
    logoUrl?: string;
    managerName?: string;
    minMembers: number;
    maxMembers: number;
    countryCode?: string;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const team = Team.create({
      id: this.ids.generate(),
      ...input,
      metadata: input.metadata ?? {},
      isActive: input.isActive ?? true,
    });

    return (await this.teams.create(team)).toPrimitives();
  }
}
