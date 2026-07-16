import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";
import { BowlerIntent } from "../../match/intent/BowlerIntent";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * Adjusts distribution based on bowler intent.
 *
 * CONTAIN — accurate bowling, fewer boundaries
 * ATTACK  — wicket-seeking, more dots but more wickets
 * YORKER  — full length, very difficult to hit but high wicket chance
 * BOUNCER — short pitched, surprise element
 */
export class BowlerIntentModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const intent = context.intent.getBowlerIntent();

    switch (intent) {
      case BowlerIntent.CONTAIN:
        return distribution
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +4))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -3))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, -2));

      case BowlerIntent.ATTACK:
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +3))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +2))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -1));

      case BowlerIntent.YORKER:
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +4))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +6))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -5))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, -5));

      case BowlerIntent.BOUNCER:
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +2))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, +2))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +2))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -2));

      default:
        return distribution;
    }
  }

  private adjust(
    dist: OutcomeDistribution,
    outcome: DeliveryOutcome,
    delta: number,
  ): number {
    return Math.max(1, (dist.getWeightFor(outcome)?.getWeight() ?? 0) + delta);
  }
}
