import type { UUID } from "./types";

export interface IdGenerator {
  generate(): UUID;
}

export interface Clock {
  now(): Date;
}

