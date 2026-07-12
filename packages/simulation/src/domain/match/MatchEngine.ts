import { InningsEngine } from "./innings/InningsEngine";
import { InningsFactory } from "./innings/InningsFactory";

import { Target } from "./target";

import { Match } from "./Match";
import { MatchResult } from "./MatchResult";
import { WinnerEvaluator } from "./WinnerEvaluator";

export class MatchEngine {
  public constructor(
    private readonly inningsFactory: InningsFactory,
    private readonly inningsEngine: InningsEngine,
    private readonly winnerEvaluator: WinnerEvaluator,
  ) {}

  public simulate(match: Match): MatchResult {
    const firstInnings = this.inningsFactory.createFirstInnings(match);

    const firstResult = this.inningsEngine.simulate(firstInnings);

    const target = new Target(
      firstResult.getInnings().getScore().getRuns() + 1,
    );

    const secondInnings = this.inningsFactory.createSecondInnings(match);

    const secondResult = this.inningsEngine.simulate(secondInnings, target);

    const winner = this.winnerEvaluator.evaluate(firstResult, secondResult);

    return new MatchResult(firstResult, secondResult, winner);
  }
}
