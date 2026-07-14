import { describe, expect, it } from "vitest";

import { BowlingSimulationProfile } from "./BowlingSimulationProfile";

describe("BowlingSimulationProfile", () => {
  it("should expose all balancing values", () => {
    const profile = new BowlingSimulationProfile(5, 3, 3);

    expect(profile.getMaxDotIncrease()).toBe(5);
    expect(profile.getMaxBoundaryReduction()).toBe(3);
    expect(profile.getMaxWicketIncrease()).toBe(3);
  });

  it("should reject negative values", () => {
    expect(() => new BowlingSimulationProfile(-1, 3, 3)).toThrow(
      "Bowling simulation profile values cannot be negative.",
    );
  });
});
