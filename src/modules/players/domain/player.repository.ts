import type { UUID } from "../../shared/types";
import type { Player } from "./player";

export interface PlayerRepository {
  create(player: Player): Promise<Player>;
  list(): Promise<Player[]>;
  findById(id: UUID): Promise<Player | null>;
}

