import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";
import { BatterIntent } from "../../match/intent/BatterIntent";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * Adjusts distribution based on batter intent.
 *
 * DEFEND     — protect wicket, minimise risk
 * ROTATE     — singles and twos, keep scoreboard moving
 * ATTACK     — boundaries preferred
 * ACCELERATE — maximum aggression, high risk/reward
 */
export class BatterIntentModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const intent = context.intent.getBatterIntent();

    switch (intent) {
      case BatterIntent.DEFEND:
        return distribution
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +8))
          .withWeight(DeliveryOutcome.ONE, this.adjust(distribution, DeliveryOutcome.ONE, +3))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, -3))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -4))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, -4));

      case BatterIntent.ROTATE:
        return distribution
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, -2))
          .withWeight(DeliveryOutcome.ONE, this.adjust(distribution, DeliveryOutcome.ONE, +4))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, -1));

      case BatterIntent.ATTACK:
        return distribution
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, +5))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, +2))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, -4))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +1));

      case BatterIntent.ACCELERATE:
        return distribution
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, +6))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, +4))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, -6))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +3));

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
