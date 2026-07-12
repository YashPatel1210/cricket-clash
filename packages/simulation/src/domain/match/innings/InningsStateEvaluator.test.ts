import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";

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
});
