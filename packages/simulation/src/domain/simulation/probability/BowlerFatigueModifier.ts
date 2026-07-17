import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

/**
 * BowlerFatigueModifier
 *
 * Fast bowlers lose effectiveness as their spell progresses.
 * A bowler in their 4th consecutive over (balls 19-24) is measurably
 * less accurate and less sharp than in their 1st over.
 *
 * Based on document: bowler effectiveness model
 *   Spell over 1: 100%
 *   Spell over 2: 95-98%
 *   Spell over 3: 88-93%  ← distribution slightly easier to score
 *   Spell over 4: 83-90%  ← more runs, fewer wickets
 *
 * The modifier reads `bowlerSpellBalls` from MatchContext which counts
 * balls in the CURRENT continuous spell (resets when the bowler is
 * taken off and brought back).
 */
export class BowlerFatigueModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const spellBalls = ctx.matchContext.getBowlerSpellBalls();
    const cfg        = ctx.config.bowlerFatigue;

    if (spellBalls > cfg.fourthOverThreshold) {
      return applyAdjustments(dist, cfg.fourthOver);
    }

    if (spellBalls > cfg.thirdOverThreshold) {
      return applyAdjustments(dist, cfg.thirdOver);
    }

    return dist;
  }
}
