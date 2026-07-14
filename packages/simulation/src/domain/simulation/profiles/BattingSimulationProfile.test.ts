import { describe, expect, it } from "vitest";

import { BattingSimulationProfile } from "./BattingSimulationProfile";

describe("BattingSimulationProfile", () => {
  it("should expose all balancing values", () => {
    const profile = new BattingSimulationProfile(5, 2, 3, 3, 3);

    expect(profile.getMaxDotReduction()).toBe(5);
    expect(profile.getMaxSingleIncrease()).toBe(2);
    expect(profile.getMaxBoundaryIncrease()).toBe(3);
    expect(profile.getMaxSixIncrease()).toBe(3);
    expect(profile.getMaxWicketReduction()).toBe(3);
  });

  it("should reject negative values", () => {
    expect(() => new BattingSimulationProfile(-1, 2, 3, 3, 3)).toThrow(
      "Batting simulation profile values cannot be negative.",
    );
  });
});
