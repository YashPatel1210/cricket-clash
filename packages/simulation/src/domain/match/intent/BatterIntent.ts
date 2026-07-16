/**
 * Batter intent on a given delivery.
 *
 * Intent is determined by match context and influences
 * the probability distribution, not the final outcome.
 */
export enum BatterIntent {
  /** Protect wicket. Minimal risk. */
  DEFEND = "DEFEND",

  /** Get off strike. Singles and twos. */
  ROTATE = "ROTATE",

  /** Drive the run rate. Boundaries preferred. */
  ATTACK = "ATTACK",

  /** Maximum aggression. Sixes and boundaries. High risk. */
  ACCELERATE = "ACCELERATE",
}
