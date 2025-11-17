import { Entity, Column, PrimaryColumn } from "typeorm";
import type { TournamentEntry } from "../../../../modules/tournaments/domain/tournament-entry";
import type { TournamentEntryStatus } from "../../../../modules/shared/types";

@Entity("tournament_entries")
export class TournamentEntryEntity implements TournamentEntry {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  tournamentId!: string;

  @Column("uuid")
  participantId!: string;

  @Column()
  status!: TournamentEntryStatus;

  @Column("uuid", { nullable: true })
  groupId?: string;

  @Column({ nullable: true })
  seed?: number;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
