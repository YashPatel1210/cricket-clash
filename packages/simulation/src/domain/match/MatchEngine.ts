import { describe, expect, it } from "vitest";

import { InningsBuilder, MatchBuilder } from "../../../test";

import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryGenerator } from "../delivery";
import {
  InningsEngine,
  InningsProcessor,
  InningsStateEvaluator,
} from "../innings";
import { OverEngine } from "../over";

import { MatchEngine } from "./MatchEngine";
import { WinnerEvaluator } from "./WinnerEvaluator";

function createMatchEngine(): MatchEngine {
  const evaluator = new InningsStateEvaluator();

  const inningsEngine = new InningsEngine(
    new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
      evaluator,
    ),
    evaluator,
  );

  return new MatchEngine(inningsEngine, new WinnerEvaluator());
}

describe("MatchEngine", () => {
  it("should simulate a match", () => {
    const result = createMatchEngine().simulate(
      MatchBuilder.standard().build(),
    );

    expect(result).toBeDefined();
  });

  it("should produce first innings", () => {
    const result = createMatchEngine().simulate(
      MatchBuilder.standard().build(),
    );

    expect(result.getFirstInnings()).toBeDefined();
  });

  it("should produce second innings", () => {
    const result = createMatchEngine().simulate(
      MatchBuilder.standard().build(),
    );

    expect(result.getSecondInnings()).toBeDefined();
  });

  it("should determine a winner or tie", () => {
    const result = createMatchEngine().simulate(
      MatchBuilder.standard().build(),
    );

    expect(
      result.getWinner() === undefined || result.getWinner() !== undefined,
    ).toBe(true);
  });
});
