import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";
import { Player } from "../../player";
import { PlayerStrength } from "../../player/PlayerStrength";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * Adjusts distribution weights based on batter and bowler strength.
 *
 * Extracted from the original BattingDistributionInfluencer and
 * BowlingDistributionInfluencer into the unified modifier pipeline.
 *
 * A stronger batter reduces dots and wickets; increases boundaries.
 * A stronger bowler increases dots and wickets; reduces boundaries.
 */
export class PlayerStrengthModifier implements OutcomeModifier {
  // Batter tuning knobs
  private static readonly MAX_DOT_REDUCTION = 5;
  private static readonly MAX_BOUNDARY_INCREASE = 3;
  private static readonly MAX_SIX_INCREASE = 3;
  private static readonly MAX_WICKET_REDUCTION = 3;

  // Bowler tuning knobs
  private static readonly MAX_DOT_INCREASE = 5;
  private static readonly MAX_BOUNDARY_REDUCTION = 3;
  private static readonly MAX_WICKET_INCREASE = 3;

  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    let dist = distribution;
    dist = this.applyBatterStrength(dist, context.striker);
    dist = this.applyBowlerStrength(dist, context.bowler);
    return dist;
  }

  private applyBatterStrength(
    distribution: OutcomeDistribution,
    batter: Player,
  ): OutcomeDistribution {
    const strength = PlayerStrength.of(batter).batting();
    const modifier = strength - 0.5;

    const dotAdj = Math.round(modifier * PlayerStrengthModifier.MAX_DOT_REDUCTION);
    const fourAdj = Math.round(modifier * PlayerStrengthModifier.MAX_BOUNDARY_INCREASE);
    const sixAdj = Math.round(modifier * PlayerStrengthModifier.MAX_SIX_INCREASE);
    const wicketAdj = Math.round(modifier * PlayerStrengthModifier.MAX_WICKET_REDUCTION);

    return this.applyBalancedAdjustments(distribution, [
      { outcome: DeliveryOutcome.DOT, delta: -dotAdj },
      { outcome: DeliveryOutcome.FOUR, delta: fourAdj },
      { outcome: DeliveryOutcome.SIX, delta: sixAdj },
      { outcome: DeliveryOutcome.WICKET, delta: -wicketAdj },
    ]);
  }

  private applyBowlerStrength(
    distribution: OutcomeDistribution,
    bowler: Player,
  ): OutcomeDistribution {
    const strength = PlayerStrength.of(bowler).bowling();
    const modifier = strength - 0.5;

    const dotAdj = Math.round(modifier * PlayerStrengthModifier.MAX_DOT_INCREASE);
    const fourAdj = Math.round(modifier * PlayerStrengthModifier.MAX_BOUNDARY_REDUCTION);
    const wicketAdj = Math.round(modifier * PlayerStrengthModifier.MAX_WICKET_INCREASE);

    return this.applyBalancedAdjustments(distribution, [
      { outcome: DeliveryOutcome.DOT, delta: dotAdj },
      { outcome: DeliveryOutcome.FOUR, delta: -fourAdj },
      { outcome: DeliveryOutcome.WICKET, delta: wicketAdj },
    ]);
  }

  private applyBalancedAdjustments(
    distribution: OutcomeDistribution,
    adjustments: { outcome: DeliveryOutcome; delta: number }[],
  ): OutcomeDistribution {
    let result = distribution;

    for (const { outcome, delta } of adjustments) {
      const current = result.getWeightFor(outcome)?.getWeight() ?? 0;
      const updated = Math.max(1, current + delta);
      result = result.withWeight(outcome, updated);
    }

    return result;
  }
}
