/**
 * Approximate average boundary distance for a venue.
 *
 * Affects six and four probability via GroundSizeModifier.
 *
 * Real venues:
 *   SMALL  — Chinnaswamy (Bengaluru), Sharjah, Eden Gardens
 *            T20 typical: 180–220 runs
 *   MEDIUM — Wankhede (Mumbai), SCG, Adelaide Oval
 *            T20 typical: 160–190 runs
 *   LARGE  — MCG, Perth Stadium, Lord's
 *            T20 typical: 150–175 runs
 */
export enum BoundarySize {
  SMALL  = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE  = "LARGE",
}
