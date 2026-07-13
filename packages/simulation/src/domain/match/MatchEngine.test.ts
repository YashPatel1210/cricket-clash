import { describe, expect, it } from "vitest";
import { TossEngine } from "./toss";
import { MatchOrderResolver } from "./MatchOrderResolver";
import { MatchBuilder } from "../../test";

import { RandomGenerator } from "../../infrastructure/random";

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

function createEngine(): MatchEngine {
  const evaluator = new InningsStateEvaluator();

  const inningsEngine = new InningsEngine(
    new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
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
});
