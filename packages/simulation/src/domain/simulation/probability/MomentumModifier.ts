import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * MomentumModifier
 *
 * Adjusts delivery probabilities based on runs scored in the previous over.
 *
 * High momentum (big previous over):
 *   Batting team is in full flow — batters are confident, finding the
 *   gaps, and bowlers are under pressure. More boundaries, fewer wickets.
 *
 * Low momentum (maiden or near-maiden previous over):
 *   Bowling team is on top — batters are tied down, dot balls accumulate,
 *   and a wicket feels imminent. More dots, elevated wicket risk.
 *
 * This creates realistic match swings: a 20-run over followed by a
 * maiden genuinely changes how the next delivery should be simulated.
 */
export class MomentumModifier implements OutcomeModifier {
  /** T20 expected runs per over baseline */
  private static readonly EXPECTED_OVER_RUNS = 8;

  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const lastOverRuns = context.matchContext.getLastOverRuns();

    // No previous over yet — no momentum signal
    if (context.matchContext.getCompletedOvers() === 0) {
      return distribution;
    }

    if (context.matchContext.isHighMomentum()) {
      // Outstanding previous over (14+ runs) — batting team dominant
      return distribution
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   +4))
        .withWeight(DeliveryOutcome.SIX,    this.adj(distribution, DeliveryOutcome.SIX,    +2))
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    -3))
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, -1));
    }

    if (lastOverRuns >= 11) {
      // Good previous over (11–13 runs) — batting slightly on top
      return distribution
        .withWeight(DeliveryOutcome.FOUR, this.adj(distribution, DeliveryOutcome.FOUR, +2))
        .withWeight(DeliveryOutcome.SIX,  this.adj(distribution, DeliveryOutcome.SIX,  +1))
        .withWeight(DeliveryOutcome.DOT,  this.adj(distribution, DeliveryOutcome.DOT,  -2));
    }

    if (context.matchContext.isLowMomentum()) {
      // Near-maiden (0–3 runs) — bowling team dominant
      return distribution
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +5))
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +2))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -3))
        .withWeight(DeliveryOutcome.ONE,    this.adj(distribution, DeliveryOutcome.ONE,    -2));
    }

    if (lastOverRuns <= 5) {
      // Below-par previous over (4–5 runs) — bowling slightly on top
      return distribution
        .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +2))
        .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +1))
        .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -1));
    }

    return distribution;
  }

  private adj(dist: OutcomeDistribution, o: DeliveryOutcome, delta: number): number {
    return Math.max(1, (dist.getWeightFor(o)?.getWeight() ?? 0) + delta);
  }
}
