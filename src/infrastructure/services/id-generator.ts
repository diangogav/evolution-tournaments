import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../../application/ports";
import type { UUID } from "../../domain/models";

export class RandomIdGenerator implements IdGenerator {
  generate(): UUID {
    return randomUUID();
  }
}

