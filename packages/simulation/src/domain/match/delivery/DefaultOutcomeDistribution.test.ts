import { describe, expect, it } from "vitest";
import { DeliveryOutcome } from "./DeliveryOutcome";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";
import { T20TuningProfile } from "../../simulation/config/T20TuningProfile";

describe("DefaultOutcomeDistribution", () => {
  const dist = new DefaultOutcomeDistribution(T20TuningProfile).getDistribution();

  it("should have a total weight of 100", () => {
    expect(dist.getTotalWeight()).toBe(100);
  });

  it("should include batting outcomes at calibrated weights", () => {
    expect(dist.getWeightFor(DeliveryOutcome.DOT)?.getWeight()).toBe(31);
    expect(dist.getWeightFor(DeliveryOutcome.ONE)?.getWeight()).toBe(25);
    expect(dist.getWeightFor(DeliveryOutcome.TWO)?.getWeight()).toBe(9);
    expect(dist.getWeightFor(DeliveryOutcome.THREE)?.getWeight()).toBe(1);
    expect(dist.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBe(13);
    expect(dist.getWeightFor(DeliveryOutcome.SIX)?.getWeight()).toBe(6);
  });

  it("should have WICKET weight of 4 (calibrated for 35% all-out rate)", () => {
    expect(dist.getWeightFor(DeliveryOutcome.WICKET)?.getWeight()).toBe(4);
  });

  it("should include extras", () => {
    expect(dist.getWeightFor(DeliveryOutcome.WIDE)?.getWeight()).toBe(5);
    expect(dist.getWeightFor(DeliveryOutcome.NO_BALL)?.getWeight()).toBe(2);
    expect(dist.getWeightFor(DeliveryOutcome.BYE)?.getWeight()).toBe(1);
    expect(dist.getWeightFor(DeliveryOutcome.LEG_BYE)?.getWeight()).toBe(2);
    expect(dist.getWeightFor(DeliveryOutcome.RUN_OUT)?.getWeight()).toBe(1);
  });
});
