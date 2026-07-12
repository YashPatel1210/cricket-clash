import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";
import { Target } from "../target";
import { Score } from "../score";

import { InningsStateEvaluator } from "./InningsStateEvaluator";

describe("InningsStateEvaluator", () => {
  it("should continue before 20 overs", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(120, 4, 119))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings)).toBe(true);
  });

  it("should stop after 20 overs", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(120, 4, 120))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings)).toBe(false);
  });

  it("should continue before ten wickets", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(120, 9, 80))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings)).toBe(true);
  });

  it("should stop after ten wickets", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(120, 10, 72))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings)).toBe(false);
  });

  it("should stop if both conditions are reached", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(200, 10, 120))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings)).toBe(false);
  });
  it("should stop when the target is reached", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(158, 3, 85))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings, new Target(158))).toBe(false);
  });

  it("should continue when the target is not reached", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(157, 3, 85))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings, new Target(158))).toBe(true);
  });

  it("should stop when the target is exceeded", () => {
    const innings = InningsBuilder.standard()
      .withScore(new Score(180, 4, 90))
      .build();

    const evaluator = new InningsStateEvaluator();

    expect(evaluator.shouldContinue(innings, new Target(158))).toBe(false);
  });
});
