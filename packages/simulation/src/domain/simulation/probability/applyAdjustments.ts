import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";
import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { OutcomeAdjustments } from "../config/OutcomeAdjustments";

/**
 * Applies OutcomeAdjustments to a distribution immutably.
 *
 * Each adjustment is an additive delta. Weights are clamped to a minimum
 * of 1 to prevent any outcome from becoming impossible.
 *
 * All modifiers use this helper so that config-driven weight changes
 * require zero code changes.
 */
export function applyAdjustments(
  distribution: OutcomeDistribution,
  adjustments: OutcomeAdjustments,
): OutcomeDistribution {
  const mapping: Array<[keyof OutcomeAdjustments, DeliveryOutcome]> = [
    ["dot",    DeliveryOutcome.DOT],
    ["one",    DeliveryOutcome.ONE],
    ["two",    DeliveryOutcome.TWO],
    ["three",  DeliveryOutcome.THREE],
    ["four",   DeliveryOutcome.FOUR],
    ["six",    DeliveryOutcome.SIX],
    ["wicket", DeliveryOutcome.WICKET],
    ["runOut", DeliveryOutcome.RUN_OUT],
    ["wide",   DeliveryOutcome.WIDE],
    ["noBall", DeliveryOutcome.NO_BALL],
    ["bye",    DeliveryOutcome.BYE],
    ["legBye", DeliveryOutcome.LEG_BYE],
  ];

  let result = distribution;

  for (const [key, outcome] of mapping) {
    const delta = adjustments[key];
    if (delta === undefined || delta === 0) continue;

    const current = result.getWeightFor(outcome)?.getWeight() ?? 0;
    result = result.withWeight(outcome, Math.max(1, current + delta));
  }

  return result;
}
