import { DeliveryOutcome } from "./DeliveryOutcome";

export class DeliveryEvent {
  public constructor(
    private readonly outcome: DeliveryOutcome,
    private readonly runs: number,
    private readonly legal: boolean,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.runs < 0) {
      throw new Error("Runs cannot be negative.");
    }
  }

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

  /**
   * Bowler gets credit.
   */
  public isWicket(): boolean {
    return this.outcome === DeliveryOutcome.WICKET;
  }

  /**
   * Any batter dismissal.
   */
  public isDismissal(): boolean {
    return (
      this.outcome === DeliveryOutcome.WICKET ||
      this.outcome === DeliveryOutcome.RUN_OUT
    );
  }

  public isWide(): boolean {
    return this.outcome === DeliveryOutcome.WIDE;
  }

  public isNoBall(): boolean {
    return this.outcome === DeliveryOutcome.NO_BALL;
  }

  public isBye(): boolean {
    return this.outcome === DeliveryOutcome.BYE;
  }

  public isLegBye(): boolean {
    return this.outcome === DeliveryOutcome.LEG_BYE;
  }

  public isExtra(): boolean {
    return this.isWide() || this.isNoBall() || this.isBye() || this.isLegBye();
  }
}
