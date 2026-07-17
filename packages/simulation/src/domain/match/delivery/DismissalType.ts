/**
 * How a batter was dismissed.
 *
 * Used in BatterRecord and on the scorecard.
 * Only WICKET outcomes carry a DismissalType — RUN_OUT is a separate
 * DeliveryOutcome (no bowler credit).
 */
export enum DismissalType {
  /** Ball hits the stumps directly. Bowler gets credit. */
  BOWLED = "BOWLED",

  /** Ball caught before touching the ground. Bowler gets credit. */
  CAUGHT = "CAUGHT",

  /** Ball would have hit the stumps, batter's leg in the way. Bowler gets credit. */
  LBW = "LBW",

  /** Wicketkeeper removes bails while batter is out of crease off a spin/medium delivery. Bowler gets credit. */
  STUMPED = "STUMPED",

  /** Batter dislodges own stumps while playing a shot. Bowler gets credit. */
  HIT_WICKET = "HIT_WICKET",

  /** Fielder throws down stumps with batter out of crease. No bowler credit. */
  RUN_OUT = "RUN_OUT",
}
