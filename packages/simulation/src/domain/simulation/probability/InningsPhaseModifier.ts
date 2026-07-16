import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";
import { InningsPhase } from "../../match/configuration/InningsPhase";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * Adjusts distribution based on the current innings phase.
 *
 * POWERPLAY   — open field, fewer fielders → more boundaries
 * DEATH_OVERS — high-pressure cricket → more sixes + wickets
 * MIDDLE_OVERS — baseline (no adjustment)
 */
export class InningsPhaseModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const phase = context.matchContext.getPhase();

    switch (phase) {
      case InningsPhase.POWERPLAY:
        return distribution
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, +4))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, +2))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, -3));

      case InningsPhase.DEATH_OVERS:
        return distribution
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, +3))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, +2))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +2))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, -2));

      case InningsPhase.MIDDLE_OVERS:
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
