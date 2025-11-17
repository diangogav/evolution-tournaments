import { Entity, Column, PrimaryColumn } from "typeorm";
import type { Group } from "../../../../modules/groups/domain/group";

@Entity("groups")
export class GroupEntity implements Group {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  tournamentId!: string;

  @Column()
  name!: string;

  @Column("simple-array")
  participants!: string[];

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, unknown>;
}
