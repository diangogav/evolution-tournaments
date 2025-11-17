import type {
  Group,
  Match,
  Participant,
  Player,
  Team,
  TeamMember,
  Tournament,
  TournamentEntry,
} from "../../../domain/models";

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

