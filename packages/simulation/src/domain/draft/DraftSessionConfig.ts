import { Country } from "@cricket-clash/shared";

import { SquadCompositionRules, T20_SQUAD_RULES } from "./SquadCompositionRules";

/**
 * Configuration for creating a DraftSession.
 *
 * Defaults are set for a standard T20 two-player draft.
 */
export interface DraftSessionConfig {
  /** Number of draft rounds to generate. Should be > squadSize to ensure variety. */
  totalRounds: number;

  /** Countries whose players will appear in rounds. */
  countries: ReadonlyArray<Country>;

  /** Composition rules for each participant's squad. */
  squadRules: SquadCompositionRules;
}

export const DEFAULT_DRAFT_CONFIG: DraftSessionConfig = {
  totalRounds: 16,   // 16 rounds for an 11-pick squad gives 5 extra rounds of flexibility
  countries: [
    Country.INDIA,
    Country.AUSTRALIA,
    Country.ENGLAND,
    Country.SOUTH_AFRICA,
    Country.NEW_ZEALAND,
    Country.WEST_INDIES,
    Country.PAKISTAN,
    Country.SRI_LANKA,
  ],
  squadRules: T20_SQUAD_RULES,
};
