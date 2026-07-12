import { DeliveryOutcome } from "./DeliveryOutcome";

export class DeliveryEvent {
  public constructor(
    private readonly outcome: DeliveryOutcome,
    private readonly runs: number,
    private readonly legal: boolean,
  ) {}

  public getOutcome(): DeliveryOutcome {
    return this.outcome;
  }

  public getRuns(): number {
    return this.runs;
  }

  public isLegal(): boolean {
    return this.legal;
  }

  public isBoundary(): boolean {
    return (
      this.outcome === DeliveryOutcome.FOUR ||
      this.outcome === DeliveryOutcome.SIX
    );
  }

  public isWicket(): boolean {
    return this.outcome === DeliveryOutcome.WICKET;
  }
}
