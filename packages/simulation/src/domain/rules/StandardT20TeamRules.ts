import type { TeamRules } from "./TeamRules";

/**
 * Standard T20 Playing XI composition rules.
 *
 * Uses literal string keys (not computed enum keys) to avoid ESM
 * static initialisation order issues in the browser bundle.
 */
export const STANDARD_T20_TEAM_RULES: TeamRules = {
  maxPlayers: 11,
  roleLimits: {
    "BATTER":        { min: 3, max: 5 },
    "BOWLER":        { min: 3, max: 5 },
    "ALL_ROUNDER":   { min: 1, max: 3 },
    "WICKET_KEEPER": { min: 1, max: 3 },
  },
};
