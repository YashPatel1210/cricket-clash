import { describe, expect, it } from "vitest";

import { BattingSimulationProfile } from "./BattingSimulationProfile";
import { BowlingSimulationProfile } from "./BowlingSimulationProfile";
import { SimulationProfile } from "./SimulationProfile";

describe("SimulationProfile", () => {
  it("should expose batting and bowling profiles", () => {
    const batting = new BattingSimulationProfile(5, 2, 3, 3, 3);

    const bowling = new BowlingSimulationProfile(5, 3, 3);

    const profile = new SimulationProfile(batting, bowling);

    expect(profile.getBatting()).toBe(batting);
    expect(profile.getBowling()).toBe(bowling);
  });
});
