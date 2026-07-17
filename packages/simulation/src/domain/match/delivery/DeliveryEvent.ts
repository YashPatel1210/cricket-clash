import { DismissalType } from "./DismissalType";
import { DeliveryOutcome } from "./DeliveryOutcome";

export class DeliveryEvent {
  public constructor(
    private readonly outcome: DeliveryOutcome,
    private readonly runs: number,
    private readonly legal: boolean,
    private readonly dismissalType?: DismissalType,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.runs < 0) {
      throw new Error("Runs cannot be negative.");
    }
  }

  public getOutcome(): DeliveryOutcome { return this.outcome; }
  public getRuns(): number             { return this.runs; }
  public isLegal(): boolean            { return this.legal; }

  public getDismissalType(): DismissalType | undefined {
    return this.dismissalType;
  }

  public isBoundary(): boolean {
    return this.outcome === DeliveryOutcome.FOUR || this.outcome === DeliveryOutcome.SIX;
  }

  /** True for WICKET outcome — bowler gets credit (unless DismissalType.RUN_OUT). */
  public isWicket(): boolean {
    return this.outcome === DeliveryOutcome.WICKET;
  }

  /** True for any batter dismissal (WICKET or RUN_OUT). */
  public isDismissal(): boolean {
    return (
      this.outcome === DeliveryOutcome.WICKET ||
      this.outcome === DeliveryOutcome.RUN_OUT
    );
  }

  /** Bowler earns a wicket in their figures (RUN_OUT does not credit bowler). */
  public isBowlerWicket(): boolean {
    return this.isDismissal() && this.dismissalType !== DismissalType.RUN_OUT;
  }

  public isWide(): boolean   { return this.outcome === DeliveryOutcome.WIDE; }
  public isNoBall(): boolean { return this.outcome === DeliveryOutcome.NO_BALL; }
  public isBye(): boolean    { return this.outcome === DeliveryOutcome.BYE; }
  public isLegBye(): boolean { return this.outcome === DeliveryOutcome.LEG_BYE; }
  public isRunOut(): boolean { return this.outcome === DeliveryOutcome.RUN_OUT; }

  public isExtra(): boolean {
    return this.isWide() || this.isNoBall() || this.isBye() || this.isLegBye();
  }

  /**
   * True when runs scored count as batter's runs.
   * Byes and leg-byes go to extras, not to the batter.
   */
  public isBatterRuns(): boolean {
    return !this.isBye() && !this.isLegBye() && !this.isWide() && !this.isRunOut();
  }

  /**
   * True when the delivery counts as a ball faced by the batter.
   * Wides do NOT count as balls faced.
   */
  public countAsBallFaced(): boolean {
    return !this.isWide();
  }
}
