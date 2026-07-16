import { describe, expect, it } from "vitest";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";

describe("DefaultOutcomeDistribution", () => {
  it("should create the default T20 distribution", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();

    expect(distribution.getTotalWeight()).toBe(100);

    expect(distribution.getWeightFor(DeliveryOutcome.DOT)?.getWeight()).toBe(32);
    expect(distribution.getWeightFor(DeliveryOutcome.ONE)?.getWeight()).toBe(28);
    expect(distribution.getWeightFor(DeliveryOutcome.TWO)?.getWeight()).toBe(10);
    expect(distribution.getWeightFor(DeliveryOutcome.THREE)?.getWeight()).toBe(1);
    expect(distribution.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBe(15);
    expect(distribution.getWeightFor(DeliveryOutcome.SIX)?.getWeight()).toBe(7);
    expect(distribution.getWeightFor(DeliveryOutcome.WICKET)?.getWeight()).toBe(7);
  });
});
