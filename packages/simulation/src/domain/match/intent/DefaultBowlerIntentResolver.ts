import { Player } from "../../player";
import { InningsPhase } from "../configuration/InningsPhase";
import { MatchContext } from "../context/MatchContext";

import { BowlerIntent } from "./BowlerIntent";
import { BowlerIntentResolver } from "./BowlerIntentResolver";

/**
 * Determines bowler intent from the current match context.
 *
 * Intent rules (see ADR-006):
 *
 * POWERPLAY           → CONTAIN  (protect early boundaries)
 * DEATH OVERS         → ATTACK   (take wickets, accept risk)
 * New batter          → ATTACK   (exploit early vulnerability)
 * Default             → CONTAIN
 */
export class DefaultBowlerIntentResolver implements BowlerIntentResolver {
  private static readonly NEW_BATTER_THRESHOLD = 8;

  public resolve(context: MatchContext, _bowler: Player): BowlerIntent {
    const phase = context.getPhase();
    const isNewBatter =
      context.getStrikerBallsFaced() <
      DefaultBowlerIntentResolver.NEW_BATTER_THRESHOLD;

    if (phase === InningsPhase.POWERPLAY) {
      return BowlerIntent.CONTAIN;
    }

    if (phase === InningsPhase.DEATH_OVERS) {
      // In death overs, attempt yorkers when game is close
      const rrr = context.getRequiredRunRate();
      if (!context.isFirstInnings() && rrr !== undefined && rrr > 12) {
        return BowlerIntent.YORKER;
      }
      return BowlerIntent.ATTACK;
    }

    if (isNewBatter) {
      return BowlerIntent.ATTACK;
    }

    return BowlerIntent.CONTAIN;
  }
}
