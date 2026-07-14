import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { OutcomeWeight } from "./OutcomeWeight";

export class DefaultOutcomeDistribution {
  public create(): OutcomeDistribution {
    return new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 32),
      new OutcomeWeight(DeliveryOutcome.ONE, 28),
      new OutcomeWeight(DeliveryOutcome.TWO, 10),
      new OutcomeWeight(DeliveryOutcome.THREE, 1),
      new OutcomeWeight(DeliveryOutcome.FOUR, 15),
      new OutcomeWeight(DeliveryOutcome.SIX, 7),
      new OutcomeWeight(DeliveryOutcome.WICKET, 7),
    ]);
  }
}
