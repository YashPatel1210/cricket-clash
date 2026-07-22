import type { RoleLimit } from "./RoleLimit";

export interface TeamRules {
  maxPlayers: number;
  /** Keyed by role string (e.g. "BATTER") — literal strings to avoid ESM init issues. */
  roleLimits: Record<string, RoleLimit>;
}
