/**
 * Per-participant status of a player in a draft round.
 */
export enum DraftPickStatus {
  /** Can be picked and placed at an eligible position. */
  AVAILABLE = "AVAILABLE",

  /** This participant already picked this player in a previous round. */
  ALREADY_PICKED = "ALREADY_PICKED",

  /** This participant's squad has all valid positions for this role filled. */
  NO_ELIGIBLE_POSITION = "NO_ELIGIBLE_POSITION",

  /** This participant has reached the maximum allowed count for this role. */
  ROLE_LIMIT_REACHED = "ROLE_LIMIT_REACHED",

  /** This participant's squad is already full (11 players picked). */
  SQUAD_FULL = "SQUAD_FULL",
}
