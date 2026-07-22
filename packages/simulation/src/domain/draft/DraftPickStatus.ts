export enum DraftPickStatus {
  /** Can be picked and placed at an eligible position. */
  AVAILABLE = "AVAILABLE",

  /** This participant already picked this player in a previous round. */
  ALREADY_PICKED = "ALREADY_PICKED",

  /** This participant's squad has all valid positions for this role filled. */
  NO_ELIGIBLE_POSITION = "NO_ELIGIBLE_POSITION",

  /** This participant has reached the maximum allowed count for this role. */
  ROLE_LIMIT_REACHED = "ROLE_LIMIT_REACHED",

  /** This participant's squad is already full (11 players selected). */
  SQUAD_FULL = "SQUAD_FULL",

  /**
   * Cannot pick this player because the squad still needs players of a
   * different role to satisfy minimums (with few picks remaining).
   * e.g. "You must pick a WK before picking another Batter."
   */
  MUST_FILL_MINIMUM = "MUST_FILL_MINIMUM",
}
