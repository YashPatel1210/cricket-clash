import { describe, expect, it } from "vitest";
import { TossEngine } from "./toss";
import { MatchOrderResolver } from "./MatchOrderResolver";
import { MatchBuilder } from "../../test";

import { RandomGenerator } from "../../infrastructure/random";

import { MatchContextFactory } from "./context/MatchContextFactory";
import { DeliveryGenerator } from "./delivery/DeliveryGenerator";
import {
  InningsEngine,
  InningsFactory,
  InningsProcessor,
  InningsStateEvaluator,
} from "../../domain/match/innings";
import { OverEngine } from "./over";

import { MatchEngine } from "./MatchEngine";
import { WinnerEvaluator } from "./WinnerEvaluator";
import { IntentEngine } from "./intent/IntentEngine";
import { DefaultBatterIntentResolver } from "./intent/DefaultBatterIntentResolver";
import { DefaultBowlerIntentResolver } from "./intent/DefaultBowlerIntentResolver";
import { DefaultProbabilityEngineFactory } from "../../domain/simulation/probability/DefaultProbabilityEngineFactory";
import { MatchConditions } from "./conditions/MatchConditions";
import { PitchType } from "./conditions/PitchType";
import { WeatherCondition } from "./conditions/WeatherCondition";
import { Stadium } from "./conditions/Stadium";
import { T20Configuration } from "./configuration/T20Configuration";

function createEngine(): MatchEngine {
  const random = new RandomGenerator(42);
  const evaluator = new InningsStateEvaluator();
  const config = new T20Configuration();
  const conditions = new MatchConditions(PitchType.FLAT, WeatherCondition.SUNNY, new Stadium("MCG"));

  const contextFactory = new MatchContextFactory(config, conditions);
  const intentEngine = new IntentEngine(
    new DefaultBatterIntentResolver(),
    new DefaultBowlerIntentResolver(),
  );
  const probabilityEngine = DefaultProbabilityEngineFactory.create();

  const inningsEngine = new InningsEngine(
    new OverEngine(
      new DeliveryGenerator(random, contextFactory, intentEngine, probabilityEngine),
      new InningsProcessor(),
      evaluator,
    ),
    evaluator,
  );

  return new MatchEngine(
    new TossEngine(new RandomGenerator(42)),
    new MatchOrderResolver(),
    new InningsFactory(),
    inningsEngine,
    new WinnerEvaluator(),
  );
}

describe("MatchEngine", () => {
  it("should simulate a match", () => {
    const result = createEngine().simulate(MatchBuilder.standard().build());

    expect(result).toBeDefined();
  });

  it("should produce first innings", () => {
    const result = createEngine().simulate(MatchBuilder.standard().build());

    expect(result.getFirstInnings()).toBeDefined();
  });

  it("should produce second innings", () => {
    const result = createEngine().simulate(MatchBuilder.standard().build());

    expect(result.getSecondInnings()).toBeDefined();
  });

  it("should determine a winner", () => {
    const result = createEngine().simulate(MatchBuilder.standard().build());

    expect(result.getWinner()).toBeDefined();
  });

  it("should produce a scorecard", () => {
    const result = createEngine().simulate(MatchBuilder.standard().build());

    expect(result.getScorecard()).toBeDefined();
  });
});
