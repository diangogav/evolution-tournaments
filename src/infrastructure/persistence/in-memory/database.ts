import type { Group } from "../../../modules/groups/domain/group";
import type { Match } from "../../../modules/matches/domain/match";
import type { Participant } from "../../../modules/participants/domain/participant";
import type { Player } from "../../../modules/players/domain/player";
import type { Team } from "../../../modules/teams/domain/team";
import type { TeamMember } from "../../../modules/teams/domain/team-member";
import type { Tournament } from "../../../modules/tournaments/domain/tournament";
import type { TournamentEntry } from "../../../modules/tournaments/domain/tournament-entry";

export type InMemoryCollections = {
  players: Map<string, Player>;
  teams: Map<string, Team>;
  teamMembers: Map<string, TeamMember>;
  participants: Map<string, Participant>;
  tournaments: Map<string, Tournament>;
  entries: Map<string, TournamentEntry>;
  groups: Map<string, Group>;
  matches: Map<string, Match>;
};

export class InMemoryDatabase {
  public readonly collections: InMemoryCollections = {
    players: new Map(),
    teams: new Map(),
    teamMembers: new Map(),
    participants: new Map(),
    tournaments: new Map(),
    entries: new Map(),
    groups: new Map(),
    matches: new Map(),
  };
}

