import { BatterIntentModifier } from "./BatterIntentModifier";
import { BowlerIntentModifier } from "./BowlerIntentModifier";
import { InningsPhaseModifier } from "./InningsPhaseModifier";
import { MatchConditionsModifier } from "./MatchConditionsModifier";
import { PlayerStrengthModifier } from "./PlayerStrengthModifier";
import { ProbabilityEngine } from "./ProbabilityEngine";
// Sprint 6: situational intelligence modifiers
import { PressureModifier } from "./PressureModifier";
import { MomentumModifier } from "./MomentumModifier";
import { BattingPositionModifier } from "./BattingPositionModifier";
import { PartnershipModifier } from "./PartnershipModifier";
import { BallConditionModifier } from "./BallConditionModifier";

/**
 * Creates the standard ProbabilityEngine with the full modifier pipeline.
 *
 * Modifier execution order matters — each modifier receives the
 * distribution produced by the previous one.
 *
 * Foundation layer (player/phase/conditions):
 *   1. PlayerStrengthModifier   — baseline quality of batter and bowler
 *   2. InningsPhaseModifier     — powerplay / middle / death adjustments
 *   3. MatchConditionsModifier  — pitch type and weather
 *   4. BallConditionModifier    — new ball swing / mid-innings flat / old ball reverse
 *
 * Situational intelligence layer (match state):
 *   5. PressureModifier         — RRR differential + wickets lost
 *   6. MomentumModifier         — last over performance
 *   7. PartnershipModifier      — partnership confidence when set
 *   8. BattingPositionModifier  — tail-ender vulnerability penalty
 *
 * Intent layer (strategic decisions):
 *   9. BatterIntentModifier     — batter's strategic intent
 *  10. BowlerIntentModifier     — bowler's strategic intent
 *
 * Adding new intelligence (Captain AI, Fatigue, Psychology, Crowd) requires
 * only implementing OutcomeModifier and inserting into this chain.
 */
export class DefaultProbabilityEngineFactory {
  public static create(): ProbabilityEngine {
    return new ProbabilityEngine([
      // ── Foundation ─────────────────────────────────────────────────
      new PlayerStrengthModifier(),
      new InningsPhaseModifier(),
      new MatchConditionsModifier(),
      new BallConditionModifier(),

      // ── Situational intelligence ────────────────────────────────────
      new PressureModifier(),
      new MomentumModifier(),
      new PartnershipModifier(),
      new BattingPositionModifier(),

      // ── Intent ────────────────────────────────────────────────────
      new BatterIntentModifier(),
      new BowlerIntentModifier(),
    ]);
  }
}
