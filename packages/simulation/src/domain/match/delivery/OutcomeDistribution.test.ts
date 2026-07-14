import { describe, expect, it } from "vitest";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { OutcomeWeight } from "./OutcomeWeight";

describe("OutcomeDistribution", () => {
  it("should expose weights", () => {
    const dot = new OutcomeWeight(DeliveryOutcome.DOT, 32);

    const four = new OutcomeWeight(DeliveryOutcome.FOUR, 15);

    const distribution = new OutcomeDistribution([dot, four]);

    expect(distribution.getWeights()).toEqual([dot, four]);
  });

  it("should calculate total weight", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
      new OutcomeWeight(DeliveryOutcome.FOUR, 15),
      new OutcomeWeight(DeliveryOutcome.WICKET, 7),
    ]);

    expect(distribution.getTotalWeight()).toBe(54);
  });

  it("should find weight for an outcome", () => {
    const four = new OutcomeWeight(DeliveryOutcome.FOUR, 15);

    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
      four,
    ]);

    expect(distribution.getWeightFor(DeliveryOutcome.FOUR)).toBe(four);
  });

  it("should return undefined for unknown outcome", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
    ]);

    expect(distribution.getWeightFor(DeliveryOutcome.SIX)).toBeUndefined();
  });

  it("should reject an empty distribution", () => {
    expect(() => new OutcomeDistribution([])).toThrow(
      "Outcome distribution must contain at least one outcome.",
    );
  });
  it("should replace an existing weight", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
      new OutcomeWeight(DeliveryOutcome.FOUR, 15),
    ]);

    const updated = distribution.withWeight(DeliveryOutcome.FOUR, 20);

    expect(updated.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBe(20);

    expect(distribution.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBe(
      15,
    );
  });
  it("should return a new distribution", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
    ]);

    const updated = distribution.withWeight(DeliveryOutcome.DOT, 40);

    expect(updated).not.toBe(distribution);
  });
  it("should preserve other outcome weights", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
      new OutcomeWeight(DeliveryOutcome.FOUR, 15),
    ]);

    const updated = distribution.withWeight(DeliveryOutcome.DOT, 30);

    expect(updated.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBe(15);
  });
});
