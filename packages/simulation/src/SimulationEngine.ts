import { RandomGenerator } from "./infrastructure/random";

import { DeliveryGenerator } from "./domain/match/delivery/DeliveryGenerator";

import {
  InningsEngine,
  InningsFactory,
  InningsProcessor,
  InningsStateEvaluator,
} from "./domain/match/innings";

import { OverEngine } from "./domain/match/over";

import {
  Match,
  MatchEngine,
  MatchResult,
  WinnerEvaluator,
} from "./domain/match";

export class SimulationEngine {
  private readonly matchEngine: MatchEngine;

  private constructor(matchEngine: MatchEngine) {
    this.matchEngine = matchEngine;
  }

  public static standard(seed: number): SimulationEngine {
    const evaluator = new InningsStateEvaluator();

    const inningsEngine = new InningsEngine(
      new OverEngine(
        new DeliveryGenerator(new RandomGenerator(seed)),
        new InningsProcessor(),
        evaluator,
      ),
      evaluator,
    );

    return new SimulationEngine(
      new MatchEngine(
        new InningsFactory(),
        inningsEngine,
        new WinnerEvaluator(),
      ),
    );
  }

  public simulate(match: Match): MatchResult {
    return this.matchEngine.simulate(match);
  }
}
