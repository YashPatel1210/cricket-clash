import { RandomGenerator } from "./infrastructure/random";

import { MatchContextFactory } from "./domain/match/context/MatchContextFactory";
import { DeliveryGenerator } from "./domain/match/delivery/DeliveryGenerator";
import {
  InningsEngine,
  InningsFactory,
  InningsProcessor,
  InningsStateEvaluator,
} from "./domain/match/innings";
import {
  DefaultBatterIntentResolver,
  DefaultBowlerIntentResolver,
  IntentEngine,
} from "./domain/match/intent";
import { OverEngine } from "./domain/match/over";
import {
  Match,
  MatchEngine,
  MatchResult,
  WinnerEvaluator,
} from "./domain/match";
import { MatchOrderResolver } from "./domain/match/MatchOrderResolver";
import { TossEngine } from "./domain/match/toss";
import { DefaultProbabilityEngineFactory } from "./domain/simulation/probability/DefaultProbabilityEngineFactory";
import { SimulationConfig } from "./domain/simulation/config/SimulationConfig";
import { T20TuningProfile } from "./domain/simulation/config/T20TuningProfile";

/**
 * Entry point for the Cricket Clash simulation engine.
 *
 * The SimulationConfig drives ALL simulation weights — pass a custom
 * config to tune for different formats, venues, or conditions without
 * touching any code.
 *
 * Usage:
 *   SimulationEngine.standard(seed)              // T20 defaults
 *   SimulationEngine.standard(seed, myConfig)    // custom tuning
 */
export class SimulationEngine {
  private constructor(
    private readonly seed: number,
    private readonly config: SimulationConfig,
  ) {}

  public static standard(
    seed: number,
    config: SimulationConfig = T20TuningProfile,
  ): SimulationEngine {
    return new SimulationEngine(seed, config);
  }

  public simulate(match: Match): MatchResult {
    const random    = new RandomGenerator(this.seed);
    const evaluator = new InningsStateEvaluator();

    const contextFactory = new MatchContextFactory(
      match.getConfiguration(),
      match.getConditions(),
    );

    const intentEngine = new IntentEngine(
      new DefaultBatterIntentResolver(),
      new DefaultBowlerIntentResolver(),
    );

    const probabilityEngine = DefaultProbabilityEngineFactory.create(this.config);

    const rules             = match.getConfiguration().getRules();
    const maxBallsPerBowler = rules.getMaxBallsPerBowler();

    const inningsEngine = new InningsEngine(
      new OverEngine(
        new DeliveryGenerator(
          random,
          contextFactory,
          intentEngine,
          probabilityEngine,
          this.config,
        ),
        new InningsProcessor(),
        evaluator,
      ),
      evaluator,
    );

    const matchEngine = new MatchEngine(
      new TossEngine(random),
      new MatchOrderResolver(),
      new InningsFactory(undefined, undefined, maxBallsPerBowler),
      inningsEngine,
      new WinnerEvaluator(),
    );

    return matchEngine.simulate(match);
  }
}
