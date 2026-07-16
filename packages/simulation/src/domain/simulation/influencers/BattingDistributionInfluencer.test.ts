import { describe, expect, it } from "vitest";
import { DefaultOutcomeDistribution } from "../../match/delivery/DefaultOutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery";

import { PlayerBuilder } from "../../../test";
import { BattingSimulationProfile } from "../profiles/BattingSimulationProfile";
import { BowlingSimulationProfile } from "../profiles/BowlingSimulationProfile";
import { SimulationProfile } from "../profiles/SimulationProfile";

import { BattingDistributionInfluencer } from "./BattingDistributionInfluencer";

describe("BattingDistributionInfluencer", () => {
  const profile = new SimulationProfile(
    new BattingSimulationProfile(5, 2, 3, 3, 3),
    new BowlingSimulationProfile(5, 3, 3),
  );

  const strongBatter = PlayerBuilder.batter()
    .withAttributes({ batting: 99, bowling: 20, fielding: 60, fitness: 80, experience: 90 })
    .build();

  it("should increase boundary probability for stronger batters", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BattingDistributionInfluencer(profile).influence(strongBatter, distribution);
    expect(updated.getWeightFor(DeliveryOutcome.FOUR)?.getWeight()).toBeGreaterThan(
      distribution.getWeightFor(DeliveryOutcome.FOUR)!.getWeight(),
    );
  });

  it("should increase six probability for stronger batters", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BattingDistributionInfluencer(profile).influence(strongBatter, distribution);
    expect(updated.getWeightFor(DeliveryOutcome.SIX)?.getWeight()).toBeGreaterThan(
      distribution.getWeightFor(DeliveryOutcome.SIX)!.getWeight(),
    );
  });

  it("should reduce wicket probability for stronger batters", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BattingDistributionInfluencer(profile).influence(strongBatter, distribution);
    expect(updated.getWeightFor(DeliveryOutcome.WICKET)?.getWeight()).toBeLessThan(
      distribution.getWeightFor(DeliveryOutcome.WICKET)!.getWeight(),
    );
  });

  it("should never reduce a weight below one", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BattingDistributionInfluencer(profile).influence(strongBatter, distribution);
    for (const weight of updated.getWeights()) {
      expect(weight.getWeight()).toBeGreaterThanOrEqual(1);
    }
  });
});
