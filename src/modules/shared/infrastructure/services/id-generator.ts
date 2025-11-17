import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../../ports";
import type { UUID } from "../../types";

export class RandomIdGenerator implements IdGenerator {
  generate(): UUID {
    return randomUUID();
  }
}

