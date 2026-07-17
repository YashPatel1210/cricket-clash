import { MatchRules } from "../domain/match/configuration";

import { Delivery, DeliveryOutcome } from "../domain/match/delivery";

export class SimulationReport {
  private deliveries = 0;

  private runs = 0;

  private wickets = 0;

  private dots = 0;

  private singles = 0;

  private twos = 0;

  private threes = 0;

  private fours = 0;

  private sixes = 0;

  public constructor(private readonly rules: MatchRules) {}

  public record(delivery: Delivery): void {
    this.runs += delivery.runs();

    // Only count legal deliveries toward overs/balls
    if (delivery.getEvent().isLegal()) {
      this.deliveries++;
    }

    switch (delivery.getEvent().getOutcome()) {
      case DeliveryOutcome.DOT:
        this.dots++;
        break;

      case DeliveryOutcome.ONE:
        this.singles++;
        break;

      case DeliveryOutcome.TWO:
        this.twos++;
        break;

      case DeliveryOutcome.THREE:
        this.threes++;
        break;

      case DeliveryOutcome.FOUR:
        this.fours++;
        break;

      case DeliveryOutcome.SIX:
        this.sixes++;
        break;

      case DeliveryOutcome.WICKET:
      case DeliveryOutcome.RUN_OUT:
        this.wickets++;
        break;
    }
  }

  public getDeliveries(): number {
    return this.deliveries;
  }

  public getOvers(): number {
    return this.deliveries / this.rules.getBallsPerOver();
  }

  public getRuns(): number {
    return this.runs;
  }

  public getWickets(): number {
    return this.wickets;
  }

  public getDots(): number {
    return this.dots;
  }

  public getSingles(): number {
    return this.singles;
  }

  public getTwos(): number {
    return this.twos;
  }

  public getThrees(): number {
    return this.threes;
  }

  public getFours(): number {
    return this.fours;
  }

  public getSixes(): number {
    return this.sixes;
  }

  public getRunsPerBall(): number {
    return this.deliveries === 0 ? 0 : this.runs / this.deliveries;
  }

  public getRunRate(): number {
    return this.getRunsPerBall() * 6;
  }

  public getDotPercentage(): number {
    return this.deliveries === 0 ? 0 : (this.dots / this.deliveries) * 100;
  }

  public getBoundaryPercentage(): number {
    return this.deliveries === 0
      ? 0
      : ((this.fours + this.sixes) / this.deliveries) * 100;
  }

  public getWicketPercentage(): number {
    return this.deliveries === 0 ? 0 : (this.wickets / this.deliveries) * 100;
  }
}
