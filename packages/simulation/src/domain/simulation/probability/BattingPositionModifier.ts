import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * BattingPositionModifier
 *
 * Applies a batting penalty to lower-order and tail-end batters.
 *
 * Positions 1–6 (top order):  no adjustment
 * Positions 7–8 (lower middle): modest penalty — capable cricketers
 *                               but technically weaker than top order
 * Positions 9–11 (tail):      significant penalty — genuine tail-enders
 *                               will slog, edge, and offer wickets cheaply
 *
 * The penalty only applies when the batter is new (< 15 balls faced).
 * Once a tail-ender survives their first few deliveries they have
 * already beaten the early dismissal window — continue normally.
 *
 * This modifier is what prevents unrealistic "350/2" innings where
 * number-11 smashes boundaries as freely as Virat Kohli.
 */
export class BattingPositionModifier implements OutcomeModifier {
  /** A new batter is vulnerable for their first 15 deliveries */
  private static readonly NEW_BATTER_VULNERABILITY_THRESHOLD = 15;

  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const ballsFaced = context.matchContext.getStrikerBallsFaced();
    const isNewBatter = ballsFaced < BattingPositionModifier.NEW_BATTER_VULNERABILITY_THRESHOLD;

    // Only apply positional penalty while the batter is new.
    // Once set, they play to their overall attributes.
    if (!isNewBatter) return distribution;

    if (context.matchContext.isTailOrder()) {
      // Positions 9–11: genuine tailenders
      // High wicket risk, few boundaries, many dot balls
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +7))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +5))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -5))
        .withWeight(DeliveryOutcome.SIX,    this.adj(distribution, DeliveryOutcome.SIX,    -4))
        .withWeight(DeliveryOutcome.ONE,    this.adj(distribution, DeliveryOutcome.ONE,    -2));
    }

    if (context.matchContext.isLowerMiddleOrder()) {
      // Positions 7–8: lower middle order
      // Technically limited, but can hit a few
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +3))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +3))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -2))
        .withWeight(DeliveryOutcome.SIX,    this.adj(distribution, DeliveryOutcome.SIX,    -2));
    }

    return distribution;
  }

  private adj(dist: OutcomeDistribution, o: DeliveryOutcome, delta: number): number {
    return Math.max(1, (dist.getWeightFor(o)?.getWeight() ?? 0) + delta);
  }
}
