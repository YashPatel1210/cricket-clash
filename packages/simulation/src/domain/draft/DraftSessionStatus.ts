export enum DraftSessionStatus {
  /** Session created, waiting for picks to begin. */
  WAITING = "WAITING",

  /** In progress — participants are making picks. */
  ACTIVE = "ACTIVE",

  /** Both squads are complete. */
  COMPLETED = "COMPLETED",
}
