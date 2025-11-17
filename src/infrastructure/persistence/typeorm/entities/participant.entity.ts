import { Entity, Column, PrimaryColumn } from "typeorm";
import type { Participant } from "../../../../modules/participants/domain/participant";
import type { ParticipantType } from "../../../../modules/shared/types";

@Entity("participants")
export class ParticipantEntity implements Participant {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  type!: ParticipantType;

  @Column("uuid")
  referenceId!: string;

  @Column()
  displayName!: string;

  @Column({ nullable: true })
  countryCode?: string;

  @Column({ nullable: true })
  seeding?: number;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
