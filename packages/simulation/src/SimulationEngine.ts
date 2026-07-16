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

/**
 * Entry point for the Cricket Clash simulation engine.
 *
 * `SimulationEngine` is stateless: each call to `simulate()` builds
 * a fully wired engine from the match's own configuration and conditions.
 *
 * Use `SimulationEngine.standard(seed)` and then call `.simulate(match)`.
 */
export class SimulationEngine {
  private constructor(private readonly seed: number) {}

  public static standard(seed: number): SimulationEngine {
    return new SimulationEngine(seed);
  }

  public simulate(match: Match): MatchResult {
    const random = new RandomGenerator(this.seed);
    const evaluator = new InningsStateEvaluator();

    // ── Match context factory (match-specific) ───────────────────────
    const contextFactory = new MatchContextFactory(
      match.getConfiguration(),
      match.getConditions(),
    );

    // ── Intent engine ────────────────────────────────────────────────
    const intentEngine = new IntentEngine(
      new DefaultBatterIntentResolver(),
      new DefaultBowlerIntentResolver(),
    );

    // ── Probability engine (modifier pipeline) ───────────────────────
    const probabilityEngine = DefaultProbabilityEngineFactory.create();

    // ── Innings engine ───────────────────────────────────────────────
    const rules = match.getConfiguration().getRules();
    const maxBallsPerBowler = rules.getMaxBallsPerBowler();

    const inningsEngine = new InningsEngine(
      new OverEngine(
        new DeliveryGenerator(
          random,
          contextFactory,
          intentEngine,
          probabilityEngine,
        ),
        new InningsProcessor(),
        evaluator,
      ),
      evaluator,
    );

    // ── Match engine ─────────────────────────────────────────────────
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
