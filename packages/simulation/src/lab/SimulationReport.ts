import { Delivery } from "../domain/match/delivery";
import { DeliveryOutcome } from "../domain/match/delivery";

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

  public record(delivery: Delivery): void {
    this.deliveries++;

    this.runs += delivery.runs();

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
        this.wickets++;
        break;
    }
  }

  public getDeliveries(): number {
    return this.deliveries;
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
    if (this.deliveries === 0) {
      return 0;
    }

    return this.runs / this.deliveries;
  }

  public getRunRate(): number {
    return this.getRunsPerBall() * 6;
  }

  public getDotPercentage(): number {
    if (this.deliveries === 0) {
      return 0;
    }

    return (this.dots / this.deliveries) * 100;
  }

  public getBoundaryPercentage(): number {
    if (this.deliveries === 0) {
      return 0;
    }

    return ((this.fours + this.sixes) / this.deliveries) * 100;
  }

  public getWicketPercentage(): number {
    if (this.deliveries === 0) {
      return 0;
    }

    return (this.wickets / this.deliveries) * 100;
  }
}
