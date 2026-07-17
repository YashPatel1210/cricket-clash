/**
 * Outcome adjustment deltas applied to a probability distribution.
 *
 * Each field is an additive delta applied to that outcome's weight.
 * Positive = more likely. Negative = less likely.
 * Missing/undefined fields = no change.
 */
export interface OutcomeAdjustments {
  dot?: number;
  one?: number;
  two?: number;
  three?: number;
  four?: number;
  six?: number;
  wicket?: number;
  runOut?: number;
  wide?: number;
  noBall?: number;
  bye?: number;
  legBye?: number;
}

/** No-op adjustment (all zeros) */
export const NO_ADJUSTMENT: OutcomeAdjustments = {};
