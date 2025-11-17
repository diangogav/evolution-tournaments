import { Entity, Column, PrimaryColumn } from "typeorm";
import type { Player } from "../../../../modules/players/domain/player";

@Entity("players")
export class PlayerEntity implements Player {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  displayName!: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  birthDate?: string;

  @Column({ nullable: true })
  countryCode?: string;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column("simple-array", { nullable: true })
  preferredDisciplines?: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
