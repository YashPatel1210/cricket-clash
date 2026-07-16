import { Player } from "../../player";
import { InningsPhase } from "../configuration/InningsPhase";
import { MatchContext } from "../context/MatchContext";

import { BatterIntent } from "./BatterIntent";
import { BatterIntentResolver } from "./BatterIntentResolver";

/**
 * Determines batter intent from the current match context.
 *
 * Intent rules (see ADR-006):
 *
 * POWERPLAY, established batter     → ATTACK
 * DEATH, 1st innings                → ACCELERATE
 * DEATH, 2nd innings, RRR > 12      → ACCELERATE
 * DEATH, 2nd innings, RRR 8–12      → ATTACK
 * DEATH, 2nd innings, RRR < 8       → ROTATE
 * MIDDLE, wickets fallen >= 7       → DEFEND
 * MIDDLE, new batter (balls < 8)    → DEFEND
 * MIDDLE, 2nd innings, RRR > 10     → ATTACK
 * Default                           → ROTATE
 */
export class DefaultBatterIntentResolver implements BatterIntentResolver {
  private static readonly NEW_BATTER_THRESHOLD = 8;
  private static readonly CRITICAL_WICKETS_THRESHOLD = 7;

  public resolve(context: MatchContext, _batter: Player): BatterIntent {
    const phase = context.getPhase();
    const isFirstInnings = context.isFirstInnings();
    const rrr = context.getRequiredRunRate();
    const isNewBatter = context.getStrikerBallsFaced() < DefaultBatterIntentResolver.NEW_BATTER_THRESHOLD;
    const wicketsFallen = 10 - context.getWicketsRemaining();

    // ── Powerplay ──────────────────────────────────────────────────────
    if (phase === InningsPhase.POWERPLAY) {
      // New batters play cautiously even in powerplay
      if (isNewBatter) return BatterIntent.DEFEND;
      return BatterIntent.ATTACK;
    }

    // ── Death Overs ────────────────────────────────────────────────────
    if (phase === InningsPhase.DEATH_OVERS) {
      if (isFirstInnings) {
        return BatterIntent.ACCELERATE;
      }

      // Chasing: intent driven by required run rate
      if (rrr !== undefined) {
        if (rrr > 12) return BatterIntent.ACCELERATE;
        if (rrr >= 8) return BatterIntent.ATTACK;
        return BatterIntent.ROTATE; // Comfortable chase — keep it calm
      }

      return BatterIntent.ATTACK;
    }

    // ── Middle Overs ───────────────────────────────────────────────────
    if (isNewBatter) return BatterIntent.DEFEND;

    if (wicketsFallen >= DefaultBatterIntentResolver.CRITICAL_WICKETS_THRESHOLD) {
      return BatterIntent.DEFEND;
    }

    if (!isFirstInnings && rrr !== undefined && rrr > 10) {
      return BatterIntent.ATTACK;
    }

    return BatterIntent.ROTATE;
  }
}
