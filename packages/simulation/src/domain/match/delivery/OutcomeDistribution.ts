import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeWeight } from "./OutcomeWeight";

export class OutcomeDistribution {
  private readonly cachedTotalWeight: number;

  public constructor(
    private readonly outcomeWeights: ReadonlyArray<OutcomeWeight>,
  ) {
    this.validate();

    this.cachedTotalWeight = this.outcomeWeights.reduce(
      (total, weight) => total + weight.getWeight(),
      0,
    );
  }

  private validate(): void {
    if (this.outcomeWeights.length === 0) {
      throw new Error(
        "Outcome distribution must contain at least one outcome.",
      );
    }
  }

  public getWeights(): ReadonlyArray<OutcomeWeight> {
    return this.outcomeWeights;
  }

  public getTotalWeight(): number {
    return this.cachedTotalWeight;
  }

  public getWeightFor(outcome: DeliveryOutcome): OutcomeWeight | undefined {
    return this.outcomeWeights.find(
      (weight) => weight.getOutcome() === outcome,
    );
  }
}
