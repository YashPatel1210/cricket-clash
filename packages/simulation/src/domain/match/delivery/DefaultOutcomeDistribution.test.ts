import { describe, expect, it } from "vitest";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";

describe("DefaultOutcomeDistribution", () => {
  it("should have a total weight of 100", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    expect(distribution.getTotalWeight()).toBe(100);
  });

  it("should include all batting outcomes", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    expect(distribution.getWeightFor(DeliveryOutcome.DOT)?.getWeight()).toBe(28);
    expect(distribution.getWeightFor(DeliveryOutcome.ONE)?.getWeight()).toBe(25);
    expect(distribution.getWeightFor(DeliveryOutcome.TWO)?.getWeight()).toBe(9);
    expect(distribution.getWeightFor(DeliveryOutcome.THREE)?.getWeight()).toBe(1);
    expect(distribution.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBe(14);
    expect(distribution.getWeightFor(DeliveryOutcome.SIX)?.getWeight()).toBe(6);
    expect(distribution.getWeightFor(DeliveryOutcome.WICKET)?.getWeight()).toBe(6);
  });

  it("should include extras", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    expect(distribution.getWeightFor(DeliveryOutcome.WIDE)?.getWeight()).toBe(5);
    expect(distribution.getWeightFor(DeliveryOutcome.NO_BALL)?.getWeight()).toBe(2);
    expect(distribution.getWeightFor(DeliveryOutcome.BYE)?.getWeight()).toBe(1);
    expect(distribution.getWeightFor(DeliveryOutcome.LEG_BYE)?.getWeight()).toBe(2);
    expect(distribution.getWeightFor(DeliveryOutcome.RUN_OUT)?.getWeight()).toBe(1);
  });
});
