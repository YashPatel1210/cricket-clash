import { describe, expect, it } from "vitest";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeWeight } from "./OutcomeWeight";

describe("OutcomeWeight", () => {
  it("should create an outcome weight", () => {
    const weight = new OutcomeWeight(DeliveryOutcome.FOUR, 15);

    expect(weight.getOutcome()).toBe(DeliveryOutcome.FOUR);

    expect(weight.getWeight()).toBe(15);
  });

  it("should reject zero weight", () => {
    expect(() => new OutcomeWeight(DeliveryOutcome.FOUR, 0)).toThrow(
      "Outcome weight must be greater than zero.",
    );
  });

  it("should reject negative weight", () => {
    expect(() => new OutcomeWeight(DeliveryOutcome.FOUR, -1)).toThrow(
      "Outcome weight must be greater than zero.",
    );
  });
});
