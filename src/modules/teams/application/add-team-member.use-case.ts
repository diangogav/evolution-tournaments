import type { Clock, IdGenerator } from "../../shared/ports";
import type { UUID } from "../../shared/types";
import type { PlayerRepository } from "../../players/domain/player.repository";
import type { TeamMember } from "../domain/team-member";
import type { TeamMemberRepository } from "../domain/team-member.repository";
import type { TeamRepository } from "../domain/team.repository";

export class AddTeamMemberUseCase {
  constructor(
    private readonly teamMembers: TeamMemberRepository,
    private readonly teams: TeamRepository,
    private readonly players: PlayerRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  execute(input: {
    teamId: UUID;
    playerId: UUID;
    role?: string;
    isCaptain?: boolean;
  }): TeamMember {
    const team = this.teams.findById(input.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const player = this.players.findById(input.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const member: TeamMember = {
      id: this.ids.generate(),
      teamId: team.id,
      playerId: player.id,
      role: input.role,
      isCaptain: input.isCaptain ?? false,
      joinedAt: this.clock.now().toISOString(),
    };

    return this.teamMembers.create(member);
  }
}

