import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * PartnershipModifier
 *
 * Models batter confidence and mutual understanding as a partnership grows.
 *
 * New partnership (0–8 balls):
 *   Both batters are at risk — the batting team is vulnerable.
 *   Elevated wicket chance.
 *
 * Building (9–25 balls):
 *   Batters have settled, beginning to read the bowlers.
 *   Neutral — no adjustment.
 *
 * Established (26–55 balls):
 *   Batters are set and confident. Partnership is growing.
 *   Fewer wickets, slightly more scoring.
 *
 * Dominant (56+ balls):
 *   Batters in complete control. Bowlers are under maximum pressure.
 *   Significantly reduced dismissal chance, free-flowing boundaries.
 *
 * This produces realistic cricket: a 100-run partnership is hard to
 * break compared to a new pair at the crease.
 */
export class PartnershipModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const partnershipBalls = context.matchContext.getPartnership().getBalls();

    if (partnershipBalls <= 8) {
      // Fresh partnership — elevated vulnerability
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +2))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +1));
    }

    if (partnershipBalls >= 56) {
      // Dominant partnership — batters completely in control
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, -3))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   +3))
        .withWeight(DeliveryOutcome.SIX,    this.adj(distribution, DeliveryOutcome.SIX,    +1))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    -2));
    }

    if (partnershipBalls >= 26) {
      // Established partnership — batters are set
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, -1))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   +1))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    -1));
    }

    return distribution;
  }

  private adj(dist: OutcomeDistribution, o: DeliveryOutcome, delta: number): number {
    return Math.max(1, (dist.getWeightFor(o)?.getWeight() ?? 0) + delta);
  }
}
