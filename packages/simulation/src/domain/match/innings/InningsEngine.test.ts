import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";
import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryGenerator } from "../delivery/DeliveryGenerator";
import { OverEngine } from "../over";

import { InningsEngine } from "./InningsEngine";
import { InningsProcessor } from "./InningsProcessor";
import { InningsStateEvaluator } from "./InningsStateEvaluator";
import { Target } from "../target";

function createEngine(): InningsEngine {
  const evaluator = new InningsStateEvaluator();

  return new InningsEngine(
    new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
      evaluator,
    ),
    evaluator,
  );
}

describe("InningsEngine", () => {
  it("should simulate a complete innings", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings);

    expect(result).toBeDefined();
  });

  it("should stop after twenty overs", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings);

    expect(result.getInnings().getScore().getBalls()).toBe(120);
  });

  it("should produce twenty overs", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings);

    expect(result.totalOvers()).toBe(20);
  });

  it("should return the final innings", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings);

    expect(result.getInnings()).toBeDefined();
  });
  it("should stop when target is reached", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings, new Target(1));

    expect(result.getInnings().getScore().getRuns()).toBeGreaterThanOrEqual(1);
  });

  it("should not exceed twenty overs while chasing", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings, new Target(500));

    expect(result.getInnings().getScore().getBalls()).toBeLessThanOrEqual(120);
  });

  it("should not exceed ten wickets while chasing", () => {
    const innings = InningsBuilder.standard().build();

    const result = createEngine().simulate(innings, new Target(500));

    expect(result.getInnings().getScore().getWickets()).toBeLessThanOrEqual(10);
  });
});
