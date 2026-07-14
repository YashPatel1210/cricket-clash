import { describe, expect, it } from "vitest";

import { DefaultSimulationProfile } from "./DefaultSimulationProfile";

describe("DefaultSimulationProfile", () => {
  it("should create the standard simulation profile", () => {
    const profile = DefaultSimulationProfile.standard();

    expect(profile.getBatting().getMaxDotReduction()).toBe(5);

    expect(profile.getBatting().getMaxBoundaryIncrease()).toBe(3);

    expect(profile.getBowling().getMaxWicketIncrease()).toBe(3);
  });
});
