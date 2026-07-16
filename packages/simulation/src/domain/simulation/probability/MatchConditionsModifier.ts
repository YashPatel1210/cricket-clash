import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";
import { PitchType } from "../../match/conditions/PitchType";
import { WeatherCondition } from "../../match/conditions/WeatherCondition";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * Adjusts distribution based on pitch type and weather conditions.
 *
 * Pitch:
 *   GREEN   — seam/swing pitch → more wickets, dots; fewer boundaries
 *   FLAT    — batting paradise → more boundaries, fewer wickets
 *   DUSTY   — spin-friendly → more wickets/dots; fewer boundaries
 *   DRY     — true but quick → marginally more runs
 *
 * Weather:
 *   OVERCAST — cloud cover assists swing → more wickets, dots
 *   CLOUDY   — light cloud → small boost to bowling
 *   SUNNY    — baseline
 */
export class MatchConditionsModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    let dist = distribution;
    dist = this.applyPitch(dist, context.matchContext.getPitchType());
    dist = this.applyWeather(dist, context.matchContext.getWeatherCondition());
    return dist;
  }

  private applyPitch(
    distribution: OutcomeDistribution,
    pitch: PitchType,
  ): OutcomeDistribution {
    switch (pitch) {
      case PitchType.GREEN:
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +3))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +2))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -2));

      case PitchType.FLAT:
        return distribution
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, +3))
          .withWeight(DeliveryOutcome.ONE, this.adjust(distribution, DeliveryOutcome.ONE, +1))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, -2))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, -3));

      case PitchType.DUSTY:
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +2))
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +3))
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, -2))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, -1));

      case PitchType.DRY:
        return distribution
          .withWeight(DeliveryOutcome.FOUR, this.adjust(distribution, DeliveryOutcome.FOUR, +1))
          .withWeight(DeliveryOutcome.SIX, this.adjust(distribution, DeliveryOutcome.SIX, +1));

      default:
        return distribution;
    }
  }

  private applyWeather(
    distribution: OutcomeDistribution,
    weather: WeatherCondition,
  ): OutcomeDistribution {
    switch (weather) {
      case WeatherCondition.OVERCAST:
        return distribution
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +2))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +2));

      case WeatherCondition.CLOUDY:
        return distribution
          .withWeight(DeliveryOutcome.DOT, this.adjust(distribution, DeliveryOutcome.DOT, +1))
          .withWeight(DeliveryOutcome.WICKET, this.adjust(distribution, DeliveryOutcome.WICKET, +1));

      case WeatherCondition.SUNNY:
      case WeatherCondition.RAINY:
      default:
        return distribution;
    }
  }

  private adjust(
    dist: OutcomeDistribution,
    outcome: DeliveryOutcome,
    delta: number,
  ): number {
    return Math.max(1, (dist.getWeightFor(outcome)?.getWeight() ?? 0) + delta);
  }
}
