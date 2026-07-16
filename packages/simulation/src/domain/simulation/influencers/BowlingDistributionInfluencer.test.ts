import { describe, expect, it } from "vitest";
import { DefaultOutcomeDistribution } from "../../match/delivery/DefaultOutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery";
import { PlayerBuilder } from "../../../test";
import { BattingSimulationProfile } from "../profiles/BattingSimulationProfile";
import { BowlingSimulationProfile } from "../profiles/BowlingSimulationProfile";
import { SimulationProfile } from "../profiles/SimulationProfile";
import { BowlingDistributionInfluencer } from "./BowlingDistributionInfluencer";

describe("BowlingDistributionInfluencer", () => {
  const profile = new SimulationProfile(
    new BattingSimulationProfile(5, 2, 3, 3, 3),
    new BowlingSimulationProfile(5, 3, 3),
  );

  const strongBowler = PlayerBuilder.bowler()
    .withAttributes({ batting: 20, bowling: 99, fielding: 70, fitness: 90, experience: 90 })
    .build();

  it("should increase dot probability for stronger bowlers", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BowlingDistributionInfluencer(profile).influence(strongBowler, distribution);
    expect(updated.getWeightFor(DeliveryOutcome.DOT)!.getWeight()).toBeGreaterThan(
      distribution.getWeightFor(DeliveryOutcome.DOT)!.getWeight(),
    );
  });

  it("should reduce four probability for stronger bowlers", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BowlingDistributionInfluencer(profile).influence(strongBowler, distribution);
    expect(updated.getWeightFor(DeliveryOutcome.FOUR)!.getWeight()).toBeLessThan(
      distribution.getWeightFor(DeliveryOutcome.FOUR)!.getWeight(),
    );
  });

  it("should increase wicket probability for stronger bowlers", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BowlingDistributionInfluencer(profile).influence(strongBowler, distribution);
    expect(updated.getWeightFor(DeliveryOutcome.WICKET)!.getWeight()).toBeGreaterThan(
      distribution.getWeightFor(DeliveryOutcome.WICKET)!.getWeight(),
    );
  });

  it("should never reduce any weight below one", () => {
    const distribution = new DefaultOutcomeDistribution().getDistribution();
    const updated = new BowlingDistributionInfluencer(profile).influence(strongBowler, distribution);
    for (const weight of updated.getWeights()) {
      expect(weight.getWeight()).toBeGreaterThanOrEqual(1);
    }
  });
});
