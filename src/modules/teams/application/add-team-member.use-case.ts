import { PlayerRepository } from "../../players/domain/player.repository";
import { Clock, IdGenerator } from "../../shared/ports";
import { UUID } from "../../shared/types";
import { TeamMember } from "../domain/team-member";
import { TeamMemberRepository } from "../domain/team-member.repository";
import { TeamRepository } from "../domain/team.repository";

export class AddTeamMemberUseCase {
  constructor(
    private readonly teamMembers: TeamMemberRepository,
    private readonly teams: TeamRepository,
    private readonly players: PlayerRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(input: {
    teamId: UUID;
    playerId: UUID;
    role?: string;
    isCaptain?: boolean;
  }) {
    const team = await this.teams.findById(input.teamId);
    if (!team) throw new Error("Team not found");

    const player = await this.players.findById(input.playerId);
    if (!player) throw new Error("Player not found");

    const currentMembers = await this.teamMembers.listByTeam(input.teamId);

    // Team full
    if (currentMembers.length >= team.maxMembers) {
      throw new Error("Team member limit reached");
    }

    // Player already in team
    if (currentMembers.some((m) => m.playerId === input.playerId)) {
      throw new Error("Player already in team");
    }

    // Captain rule
    if (input.isCaptain) {
      const alreadyCaptain = currentMembers.some((member) => member.isCaptain);
      if (alreadyCaptain) throw new Error("Team already has a captain");
    }

    const member = TeamMember.create({
      id: this.ids.generate(),
      teamId: input.teamId,
      playerId: input.playerId,
      role: input.role ?? null,
      isCaptain: input.isCaptain ?? false,
      joinedAt: this.clock.now().toISOString(),
    });

    return (await this.teamMembers.create(member)).toPrimitives();
  }
}
