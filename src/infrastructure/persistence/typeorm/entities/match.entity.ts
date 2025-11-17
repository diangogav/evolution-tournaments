import { Entity, Column, PrimaryColumn } from "typeorm";
import type { Match } from "../../../../modules/matches/domain/match";
import type { MatchParticipant } from "../../../../modules/matches/domain/match-participant";
import type { TournamentFormat } from "../../../../modules/shared/types";

@Entity("matches")
export class MatchEntity implements Match {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  tournamentId!: string;

  @Column()
  roundNumber!: number;

  @Column({ nullable: true })
  stage?: string;

  @Column({ nullable: true })
  bestOf?: number;

  @Column({ nullable: true })
  scheduledAt?: string;

  @Column({ nullable: true })
  completedAt?: string;

  @Column({ nullable: true })
  format?: TournamentFormat;

  @Column("jsonb")
  participants!: [MatchParticipant, MatchParticipant];

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
