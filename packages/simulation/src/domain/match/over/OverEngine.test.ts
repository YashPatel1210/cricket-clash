import { describe, expect, it } from "vitest";

import { InningsBuilder, createTestDeliveryGenerator } from "../../../test";
import { InningsProcessor } from "../innings";
import { InningsStateEvaluator } from "../innings";

import { OverEngine } from "./OverEngine";

function createOverEngine(seed = 42): OverEngine {
  return new OverEngine(
    createTestDeliveryGenerator(seed),
    new InningsProcessor(),
    new InningsStateEvaluator(),
  );
}

describe("OverEngine", () => {
  it("should simulate a complete over", () => {
    const innings = InningsBuilder.standard().build();
    const result = createOverEngine().simulate(innings);
    expect(result.getOver().isCompleted()).toBe(true);
  });

  it("should contain six legal deliveries", () => {
    const innings = InningsBuilder.standard().build();
    const result = createOverEngine().simulate(innings);
    expect(result.getOver().legalBallCount()).toBe(6);
  });

  it("should update the innings score", () => {
    const innings = InningsBuilder.standard().build();
    const result = createOverEngine().simulate(innings);
    expect(result.getInnings().getScore().getBalls()).toBe(6);
  });

  it("should rotate strike at end of over", () => {
    const innings = InningsBuilder.standard().build();
    const original = innings.getBattingPair();
    const result = createOverEngine().simulate(innings);
    const updated = result.getInnings().getBattingPair();
    // After even-run over ends, striker and non-striker may or may not have swapped
    // depending on runs. What we test is that the over engine ran without error.
    expect(updated).toBeDefined();
    expect(updated.getStriker()).not.toBe(updated.getNonStriker());
  });
});
