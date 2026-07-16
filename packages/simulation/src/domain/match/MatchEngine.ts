import { InningsEngine } from "./innings";
import { InningsFactory } from "./innings";
import { Scorecard } from "./scorecard/Scorecard";

import { Target } from "./target";

import { Match } from "./Match";
import { MatchResult } from "./MatchResult";
import { WinnerEvaluator } from "./WinnerEvaluator";

import { TossEngine } from "./toss";
import { MatchOrderResolver } from "./MatchOrderResolver";

export class MatchEngine {
  public constructor(
    private readonly tossEngine: TossEngine,
    private readonly matchOrderResolver: MatchOrderResolver,
    private readonly inningsFactory: InningsFactory,
    private readonly inningsEngine: InningsEngine,
    private readonly winnerEvaluator: WinnerEvaluator,
  ) {}

  public simulate(match: Match): MatchResult {
    // ── Toss ──────────────────────────────────────────────────────────
    const toss = this.tossEngine.conduct(match);

    const matchOrder = this.matchOrderResolver.resolve(match, toss);

    // ── First Innings ─────────────────────────────────────────────────
    const firstResult = this.inningsEngine.simulate(
      this.inningsFactory.create(matchOrder.getFirstInnings()),
    );

    const target = new Target(
      firstResult.getInnings().getScore().getRuns() + 1,
    );

    // ── Second Innings ────────────────────────────────────────────────
    const secondResult = this.inningsEngine.simulate(
      this.inningsFactory.create(matchOrder.getSecondInnings()),
      target,
    );

    // ── Winner ────────────────────────────────────────────────────────
    const winner = this.winnerEvaluator.evaluate(firstResult, secondResult);

    // ── Scorecard ─────────────────────────────────────────────────────
    const scorecard = new Scorecard(
      toss,
      firstResult,
      secondResult,
      firstResult.getInnings().getStatistics(),
      secondResult.getInnings().getStatistics(),
      winner,
    );

    return new MatchResult(firstResult, secondResult, winner, scorecard);
  }
}
