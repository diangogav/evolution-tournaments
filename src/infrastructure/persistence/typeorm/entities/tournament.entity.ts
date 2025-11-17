import { Entity, Column, PrimaryColumn } from "typeorm";
import type { Tournament } from "../../../../modules/tournaments/domain/tournament";
import type {
  TournamentFormat,
  TournamentStatus,
  ParticipantType,
} from "../../../../modules/shared/types";

@Entity("tournaments")
export class TournamentEntity implements Tournament {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  discipline!: string;

  @Column()
  format!: TournamentFormat;

  @Column()
  status!: TournamentStatus;

  @Column({ default: false })
  allowMixedParticipants!: boolean;

  @Column({ nullable: true })
  participantType?: ParticipantType;

  @Column({ nullable: true })
  maxParticipants?: number;

  @Column({ nullable: true })
  startAt?: string;

  @Column({ nullable: true })
  endAt?: string;

  @Column({ nullable: true })
  location?: string;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
