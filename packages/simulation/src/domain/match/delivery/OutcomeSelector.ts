import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";

export class OutcomeSelector {
  public constructor(
    private readonly random: RandomGenerator,
    private readonly distribution: OutcomeDistribution,
  ) {}

  public select(): DeliveryOutcome {
    let randomWeight =
      this.random.nextFloat() * this.distribution.getTotalWeight();

    for (const weight of this.distribution.getWeights()) {
      randomWeight -= weight.getWeight();

      if (randomWeight < 0) {
        return weight.getOutcome();
      }
    }

    throw new Error("Unable to select a delivery outcome.");
  }
}
