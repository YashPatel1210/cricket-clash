import { BatterIntentModifier } from "./BatterIntentModifier";
import { BowlerIntentModifier } from "./BowlerIntentModifier";
import { InningsPhaseModifier } from "./InningsPhaseModifier";
import { MatchConditionsModifier } from "./MatchConditionsModifier";
import { PlayerStrengthModifier } from "./PlayerStrengthModifier";
import { ProbabilityEngine } from "./ProbabilityEngine";

/**
 * Creates the standard ProbabilityEngine with the default modifier pipeline.
 *
 * Modifier order matters: each modifier receives the output of the previous.
 *
 * Order:
 * 1. PlayerStrengthModifier  — player quality baseline
 * 2. InningsPhaseModifier    — phase-specific adjustments
 * 3. MatchConditionsModifier — pitch and weather
 * 4. BatterIntentModifier    — batter's strategic intent
 * 5. BowlerIntentModifier    — bowler's strategic intent
 */
export class DefaultProbabilityEngineFactory {
  public static create(): ProbabilityEngine {
    return new ProbabilityEngine([
      new PlayerStrengthModifier(),
      new InningsPhaseModifier(),
      new MatchConditionsModifier(),
      new BatterIntentModifier(),
      new BowlerIntentModifier(),
    ]);
  }
}
