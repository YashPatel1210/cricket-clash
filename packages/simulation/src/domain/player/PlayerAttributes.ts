/**
 * PlayerAttributes — complete player DNA.
 *
 * Core attributes (batting, bowling, fielding, fitness, experience) are
 * required and drive the base probability calculations.
 *
 * Specialisation attributes are optional. When absent they fall back
 * to the relevant core attribute, so existing players continue to work
 * without changes.
 *
 * Specialisations enable realistic matchup simulation:
 *   - A pace specialist (high againstPace) performs well vs swing bowling
 *   - A death-hitter (high deathHitting) accelerates in overs 16-20
 *   - A genuine spinner (high spinAmount) is more effective mid-innings
 */
export interface PlayerAttributes {

  // ── Core (always required, 0–99) ──────────────────────────────────
  batting:    number;
  bowling:    number;
  fielding:   number;
  fitness:    number;
  experience: number;

  // ── Batting specialisations (optional, fall back to batting) ──────

  /** Clean ball-striking — affects boundary rate */
  timing?: number;

  /** Clearing the boundary — affects six rate */
  powerHitting?: number;

  /** Shot selection and footwork — reduces wicket risk when set */
  technique?: number;

  /** Running between wickets — affects single/double rate */
  strikeRotation?: number;

  /** Performance specifically vs pace bowling (seam + swing) */
  againstPace?: number;

  /** Performance specifically vs spin bowling */
  againstSpin?: number;

  /** Aggression and performance in overs 1–6 */
  powerplayAggression?: number;

  /** Slog/finisher ability in overs 16–20 */
  deathHitting?: number;

  // ── Bowling specialisations (optional, fall back to bowling) ──────

  /** Raw pace in km/h tier — affects difficulty for batters */
  pace?: number;

  /** Swing in air (conventional new ball + reverse old ball) */
  swing?: number;

  /** Seam movement off the pitch */
  seam?: number;

  /** Amount of turn for spin bowlers */
  spinAmount?: number;

  /** Variations: slower ball, googly, knuckleball */
  variations?: number;

  /** Hitting the blockhole in the death overs */
  yorkerAccuracy?: number;

  /** Death bowling effectiveness (overs 16–20) */
  deathBowling?: number;

  /** New ball effectiveness (overs 1–6) */
  newBallSkill?: number;
}

/**
 * Resolves effective batting attribute given the bowling type and game phase.
 *
 * Falls back to core `batting` when specialised attributes are not set.
 */
export function effectiveBatting(
  attrs: PlayerAttributes,
  opts: {
    isPaceBowler?: boolean;
    isSpinBowler?: boolean;
    isDeathOvers?: boolean;
    isPowerplay?: boolean;
  },
): number {
  if (opts.isDeathOvers && attrs.deathHitting !== undefined) {
    return attrs.deathHitting;
  }
  if (opts.isPowerplay && attrs.powerplayAggression !== undefined) {
    return attrs.powerplayAggression;
  }
  if (opts.isPaceBowler && attrs.againstPace !== undefined) {
    return attrs.againstPace;
  }
  if (opts.isSpinBowler && attrs.againstSpin !== undefined) {
    return attrs.againstSpin;
  }
  return attrs.batting;
}

/**
 * Resolves effective bowling attribute given the game phase.
 *
 * Falls back to core `bowling` when specialised attributes are not set.
 */
export function effectiveBowling(
  attrs: PlayerAttributes,
  opts: {
    isDeathOvers?: boolean;
    isPowerplay?: boolean;
    isNewBall?: boolean;
  },
): number {
  if (opts.isDeathOvers && attrs.deathBowling !== undefined) {
    return attrs.deathBowling;
  }
  if ((opts.isPowerplay || opts.isNewBall) && attrs.newBallSkill !== undefined) {
    return attrs.newBallSkill;
  }
  return attrs.bowling;
}
