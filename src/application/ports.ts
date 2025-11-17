import type { UUID } from "../domain/models";

export interface IdGenerator {
  generate(): UUID;
}

export interface Clock {
  now(): Date;
}

