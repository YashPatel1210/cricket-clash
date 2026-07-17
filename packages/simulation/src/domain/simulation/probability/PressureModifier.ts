import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * PressureModifier
 *
 * Adjusts delivery probabilities based on the computed pressure index (0–1).
 *
 * High pressure forces batters into riskier shots and more mistakes:
 *   - More wickets (panic play, poor shot selection)
 *   - More boundaries (desperation sixes)
 *   - Fewer dots (forced to attack)
 *
 * Low pressure encourages conservative, controlled batting:
 *   - Fewer wickets (technically correct play)
 *   - More dots and singles (building an innings)
 *
 * This makes chasing realistic: a team needing 60 off 24 bats
 * very differently from a team cruising needing 20 off 24.
 */
export class PressureModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const pressure = context.matchContext.getPressureIndex();

    if (context.matchContext.isHighPressure()) {
      // Desperation — big shots, poor decisions, more dismissals
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +4))
        .withWeight(DeliveryOutcome.SIX,    this.adj(distribution, DeliveryOutcome.SIX,    +3))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   +2))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    -3));
    }

    if (context.matchContext.isMediumPressure()) {
      // Alert — batter pushing for runs, slightly elevated risk
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +2))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   +1))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    -1));
    }

    if (context.matchContext.isLowPressure()) {
      // Comfortable — technically sound, building innings
      return distribution
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, -2))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +2))
        .withWeight(DeliveryOutcome.ONE,    this.adj(distribution, DeliveryOutcome.ONE,    +2));
    }

    return distribution;
  }

  private adj(dist: OutcomeDistribution, o: DeliveryOutcome, delta: number): number {
    return Math.max(1, (dist.getWeightFor(o)?.getWeight() ?? 0) + delta);
  }
}
