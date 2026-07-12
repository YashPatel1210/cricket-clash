import { Team } from "../team";
import { InningsResult } from "./innings";

export class WinnerEvaluator {
  public evaluate(
    firstInnings: InningsResult,
    secondInnings: InningsResult,
  ): Team | undefined {
    const firstScore = firstInnings.getInnings().getScore();

    const secondScore = secondInnings.getInnings().getScore();

    if (secondScore.getRuns() > firstScore.getRuns()) {
      return secondInnings.getInnings().getBattingTeam();
    }

    if (firstScore.getRuns() > secondScore.getRuns()) {
      return firstInnings.getInnings().getBattingTeam();
    }

    return undefined;
  }
}
