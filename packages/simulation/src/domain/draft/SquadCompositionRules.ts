import { PlayerRole } from "@cricket-clash/shared";

export interface RoleLimit {
  min: number;
  max: number;
}

export interface SquadCompositionRules {
  squadSize: number;
  limits: Record<string, RoleLimit>;
}

/**
 * Standard T20 squad composition rules.
 *
 * Uses literal string keys (not computed enum keys) to avoid ESM
 * static initialisation order issues in the browser bundle.
 */
export const T20_SQUAD_RULES: SquadCompositionRules = {
  squadSize: 11,
  limits: {
    "BATTER":        { min: 3, max: 6 },
    "ALL_ROUNDER":   { min: 1, max: 3 },
    "BOWLER":        { min: 3, max: 6 },
    "WICKET_KEEPER": { min: 1, max: 2 },
  },
};

// Re-export PlayerRole so callers don't need a separate import
export { PlayerRole };
