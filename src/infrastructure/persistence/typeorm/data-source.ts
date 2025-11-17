import "reflect-metadata";
import { DataSource } from "typeorm";
import { PlayerEntity } from "./entities/player.entity";
import { TeamEntity } from "./entities/team.entity";
import { TeamMemberEntity } from "./entities/team-member.entity";
import { ParticipantEntity } from "./entities/participant.entity";
import { TournamentEntity } from "./entities/tournament.entity";
import { TournamentEntryEntity } from "./entities/tournament-entry.entity";
import { GroupEntity } from "./entities/group.entity";
import { MatchEntity } from "./entities/match.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tournaments",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.DB_LOGGING === "true",
  entities: [
    PlayerEntity,
    TeamEntity,
    TeamMemberEntity,
    ParticipantEntity,
    TournamentEntity,
    TournamentEntryEntity,
    GroupEntity,
    MatchEntity,
  ],
  migrations: [],
  subscribers: [],
});
