import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";

import { ModifierContext } from "./ModifierContext";

/**
 * Strategy interface for modifying a probability distribution.
 *
 * Each modifier receives the current distribution and modifier context,
 * and returns a new distribution with adjusted weights.
 *
 * Modifiers are applied in sequence by ProbabilityEngine.
 * Adding a new modifier (Captain AI, Momentum, Fatigue, etc.)
 * requires only implementing this interface.
 */
export interface OutcomeModifier {
  modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution;
}
