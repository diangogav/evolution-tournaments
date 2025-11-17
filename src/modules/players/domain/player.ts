import type { Identified } from "../../shared/types";

export interface Player extends Identified {
  displayName: string;
  nickname?: string;
  birthDate?: string;
  countryCode?: string;
  contactEmail?: string;
  preferredDisciplines?: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

