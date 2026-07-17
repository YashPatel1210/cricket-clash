/**
 * Raw player DNA attributes as stored in JSON.
 * Mirrors PlayerAttributes from the simulation package
 * but lives here independently — no circular dependency.
 */
export interface PlayerDNA {
  // ── Core (always required) ────────────────────────────────────────
  batting:    number;
  bowling:    number;
  fielding:   number;
  fitness:    number;
  experience: number;

  // ── Batting specialisations (optional) ───────────────────────────
  technique?:           number;
  powerHitting?:        number;
  timing?:              number;
  strikeRotation?:      number;
  againstPace?:         number;
  againstSpin?:         number;
  powerplayAggression?: number;
  deathHitting?:        number;

  // ── Bowling specialisations (optional) ───────────────────────────
  pace?:          number;
  swing?:         number;
  seam?:          number;
  spinAmount?:    number;
  variations?:    number;
  yorkerAccuracy?: number;
  deathBowling?:  number;
  newBallSkill?:  number;
}

export interface PlayerMeta {
  age?:              number;
  internationalCaps?: number;
  /** ISO year-month of last attribute update, e.g. "2026-07" */
  lastUpdated?:      string;
  knownFor?:         string;
}

/**
 * One player entry as stored in a country JSON file.
 */
export interface PlayerData {
  id:           string;
  name:         string;
  /** Matches Country enum value, e.g. "India" */
  country:      string;
  /** Matches PlayerRole enum value, e.g. "BATTER" */
  role:         "BATTER" | "WICKET_KEEPER" | "ALL_ROUNDER" | "BOWLER";
  /** Matches Handedness enum value */
  handedness:   "RIGHT" | "LEFT";
  /** Matches BattingStyle enum value */
  battingStyle: "RIGHT_HAND" | "LEFT_HAND";
  /** Matches BowlingStyle enum value or null for non-bowlers */
  bowlingStyle: string | null;
  /** Player archetype key for AI grouping */
  archetype?:   string;
  dna:          PlayerDNA;
  meta?:        PlayerMeta;
}

/**
 * Shape of a country player file, e.g. india.json
 */
export interface CountryPlayerFile {
  version:  string;
  country:  string;
  players:  PlayerData[];
}
