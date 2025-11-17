import type { Identified } from "../../shared/types";

export interface Team extends Identified {
  displayName: string;
  shortCode?: string;
  logoUrl?: string;
  managerName?: string;
  minMembers: number;
  maxMembers: number;
  countryCode?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

