import { Target } from "../target";

import { Innings } from "./Innings";

export class InningsStateEvaluator {
  private static readonly MAX_BALLS = 120;

  private static readonly MAX_WICKETS = 10;

  public shouldContinue(innings: Innings, target?: Target): boolean {
    const score = innings.getScore();

    // Second innings: stop immediately if the target has been reached.
    if (target && target.isReached(score)) {
      return false;
    }

    // Stop if maximum balls have been bowled.
    if (score.getBalls() >= InningsStateEvaluator.MAX_BALLS) {
      return false;
    }

    // Stop if all wickets have fallen.
    if (score.getWickets() >= InningsStateEvaluator.MAX_WICKETS) {
      return false;
    }

    return true;
  }
}
