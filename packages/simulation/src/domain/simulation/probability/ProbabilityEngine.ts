import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * Applies a sequential pipeline of OutcomeModifiers to a base distribution.
 *
 * This is the central probability calculation component. Adding new
 * simulation intelligence (Captain AI, Momentum, Fatigue, etc.) requires
 * only adding a new OutcomeModifier to this pipeline.
 */
export class ProbabilityEngine {
  public constructor(private readonly modifiers: ReadonlyArray<OutcomeModifier>) {}

  public calculate(
    base: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    return this.modifiers.reduce(
      (distribution, modifier) => modifier.modify(distribution, context),
      base,
    );
  }
}
