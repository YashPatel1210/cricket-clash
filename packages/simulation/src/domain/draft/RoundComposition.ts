/**
 * RoundComposition — the role breakdown of the 11 players in a draft round.
 *
 * All valid compositions must sum to 11 and satisfy T20 squad rules.
 * Varying compositions make each round feel different and prevent
 * all-batter or all-bowler rounds.
 */
export interface RoundComposition {
  batters: number;
  allRounders: number;
  bowlers: number;
  wicketKeepers: number;
}

/**
 * The set of valid round compositions used by DraftRoundGenerator.
 *
 * Each template represents a realistic cricket team composition.
 * Selected randomly per round to ensure variety.
 */
export const ROUND_COMPOSITION_TEMPLATES: ReadonlyArray<RoundComposition> = [
  { batters: 5, allRounders: 2, bowlers: 3, wicketKeepers: 1 }, // aggressive batting
  { batters: 4, allRounders: 2, bowlers: 4, wicketKeepers: 1 }, // balanced
  { batters: 4, allRounders: 1, bowlers: 5, wicketKeepers: 1 }, // bowling heavy
  { batters: 5, allRounders: 1, bowlers: 4, wicketKeepers: 1 }, // batting-biased balanced
  { batters: 4, allRounders: 2, bowlers: 3, wicketKeepers: 2 }, // dual keeper
  { batters: 5, allRounders: 1, bowlers: 3, wicketKeepers: 2 }, // batting + dual keeper
  { batters: 3, allRounders: 3, bowlers: 4, wicketKeepers: 1 }, // all-rounder heavy
  { batters: 4, allRounders: 3, bowlers: 3, wicketKeepers: 1 }, // strong all-rounders
];
