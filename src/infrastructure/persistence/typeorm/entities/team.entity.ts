import { Entity, Column, PrimaryColumn } from "typeorm";
import type { Team } from "../../../../modules/teams/domain/team";

@Entity("teams")
export class TeamEntity implements Team {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  displayName!: string;

  @Column({ nullable: true })
  shortCode?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  managerName?: string;

  @Column()
  minMembers!: number;

  @Column()
  maxMembers!: number;

  @Column({ nullable: true })
  countryCode?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
