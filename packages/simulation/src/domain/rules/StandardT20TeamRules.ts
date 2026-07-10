import { PlayerRole } from "@cricket-clash/shared";

import type { TeamRules } from "./TeamRules";

export const STANDARD_T20_TEAM_RULES: TeamRules = {
  maxPlayers: 11,

  roleLimits: {
    [PlayerRole.BATTER]: {
      min: 3,
      max: 5,
    },

    [PlayerRole.BOWLER]: {
      min: 3,
      max: 5,
    },

    [PlayerRole.ALL_ROUNDER]: {
      min: 1,
      max: 3,
    },

    [PlayerRole.WICKET_KEEPER]: {
      min: 1,
      max: 3,
    },
  },
};