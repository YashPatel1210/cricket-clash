/**
 * Bowler intent on a given delivery.
 *
 * Intent is determined by match context and influences
 * the probability distribution, not the final outcome.
 */
export enum BowlerIntent {
  /** Keep runs down. Accurate line and length. */
  CONTAIN = "CONTAIN",

  /** Take a wicket. Aggressive line. */
  ATTACK = "ATTACK",

  /** Full-length yorker. High skill, high reward. */
  YORKER = "YORKER",

  /** Short-pitched delivery. Surprise element. */
  BOUNCER = "BOUNCER",
}
