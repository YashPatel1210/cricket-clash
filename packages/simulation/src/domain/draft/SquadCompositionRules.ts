import { PlayerRole } from "@cricket-clash/shared";

/**
 * Squad composition rules (min/max per role, total squad size).
 *
 * Default is a standard T20 Playing XI:
 *   BATTER:        3–6
 *   ALL_ROUNDER:   1–3
 *   BOWLER:        3–6
 *   WICKET_KEEPER: 1–2
 *   Total:         11
 */
export interface RoleLimit {
  min: number;
  max: number;
}

export interface SquadCompositionRules {
  squadSize: number;
  limits: Record<PlayerRole, RoleLimit>;
}

export const T20_SQUAD_RULES: SquadCompositionRules = {
  squadSize: 11,
  limits: {
    [PlayerRole.BATTER]:        { min: 3, max: 6 },
    [PlayerRole.ALL_ROUNDER]:   { min: 1, max: 3 },
    [PlayerRole.BOWLER]:        { min: 3, max: 6 },
    [PlayerRole.WICKET_KEEPER]: { min: 1, max: 2 },
  },
};
