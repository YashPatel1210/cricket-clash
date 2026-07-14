import { Player } from "../../player";
import { PlayerStrength } from "../../player/PlayerStrength";
import { DeliveryOutcome } from "../../match/delivery";
import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";

import { SimulationProfile } from "../profiles/SimulationProfile";

import { DistributionInfluencer } from "./DistributionInfluencer";

export class BattingDistributionInfluencer implements DistributionInfluencer {
  public constructor(private readonly profile: SimulationProfile) {}

  public influence(
    striker: Player,
    distribution: OutcomeDistribution,
  ): OutcomeDistribution {
    const strength = PlayerStrength.of(striker).batting();

    const modifier = strength - 0.5;

    const batting = this.profile.getBatting();

    const dotWeight = distribution
      .getWeightFor(DeliveryOutcome.DOT)!
      .getWeight();

    const fourWeight = distribution
      .getWeightFor(DeliveryOutcome.FOUR)!
      .getWeight();

    const sixWeight = distribution
      .getWeightFor(DeliveryOutcome.SIX)!
      .getWeight();

    const wicketWeight = distribution
      .getWeightFor(DeliveryOutcome.WICKET)!
      .getWeight();

    const dotAdjustment = Math.round(modifier * batting.getMaxDotReduction());

    const fourAdjustment = Math.round(
      modifier * batting.getMaxBoundaryIncrease(),
    );

    const sixAdjustment = Math.round(modifier * batting.getMaxSixIncrease());

    const wicketAdjustment = Math.round(
      modifier * batting.getMaxWicketReduction(),
    );

    let updatedDot = Math.max(1, dotWeight - dotAdjustment);

    const updatedFour = Math.max(1, fourWeight + fourAdjustment);

    const updatedSix = Math.max(1, sixWeight + sixAdjustment);

    const updatedWicket = Math.max(1, wicketWeight - wicketAdjustment);

    const originalTotal = dotWeight + fourWeight + sixWeight + wicketWeight;

    const updatedTotal = updatedDot + updatedFour + updatedSix + updatedWicket;

    updatedDot += originalTotal - updatedTotal;

    updatedDot = Math.max(1, updatedDot);

    return distribution
      .withWeight(DeliveryOutcome.DOT, updatedDot)
      .withWeight(DeliveryOutcome.FOUR, updatedFour)
      .withWeight(DeliveryOutcome.SIX, updatedSix)
      .withWeight(DeliveryOutcome.WICKET, updatedWicket);
  }
}
