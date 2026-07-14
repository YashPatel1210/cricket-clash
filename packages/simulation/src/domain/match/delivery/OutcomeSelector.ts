import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";

export class OutcomeSelector {
  public constructor(private readonly random: RandomGenerator) {}

  public select(distribution: OutcomeDistribution): DeliveryOutcome {
    let randomWeight = this.random.nextFloat() * distribution.getTotalWeight();

    for (const weight of distribution.getWeights()) {
      randomWeight -= weight.getWeight();

      if (randomWeight < 0) {
        return weight.getOutcome();
      }
    }

    throw new Error("Unable to select a delivery outcome.");
  }
}
