import { DeliveryOutcome } from "./DeliveryOutcome";

export class OutcomeWeight {
  public constructor(
    private readonly outcome: DeliveryOutcome,
    private readonly weight: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.weight <= 0) {
      throw new Error("Outcome weight must be greater than zero.");
    }
  }

  public getOutcome(): DeliveryOutcome {
    return this.outcome;
  }

  public getWeight(): number {
    return this.weight;
  }
}
