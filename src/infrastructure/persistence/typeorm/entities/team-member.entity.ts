import { Entity, Column, PrimaryColumn } from "typeorm";
import type { TeamMember } from "../../../../modules/teams/domain/team-member";

@Entity("team_members")
export class TeamMemberEntity implements TeamMember {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  teamId!: string;

  @Column("uuid")
  playerId!: string;

  @Column({ nullable: true })
  role?: string;

  @Column({ default: false })
  isCaptain!: boolean;

  @Column()
  joinedAt!: string;

  @Column({ nullable: true })
  leftAt?: string;
}
