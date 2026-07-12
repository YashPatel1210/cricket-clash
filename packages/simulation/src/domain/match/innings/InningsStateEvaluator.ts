import { Innings } from "./Innings";

export class InningsStateEvaluator {
  private static readonly MAX_BALLS = 120;

  private static readonly MAX_WICKETS = 10;

  public shouldContinue(innings: Innings): boolean {
    const score = innings.getScore();

    return (
      score.getBalls() < InningsStateEvaluator.MAX_BALLS &&
      score.getWickets() < InningsStateEvaluator.MAX_WICKETS
    );
  }
}
