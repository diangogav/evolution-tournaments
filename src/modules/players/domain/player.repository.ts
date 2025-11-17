import type { UUID } from "../../shared/types";
import type { Player } from "./player";

export interface PlayerRepository {
  create(player: Player): Player;
  list(): Player[];
  findById(id: UUID): Player | undefined;
}

