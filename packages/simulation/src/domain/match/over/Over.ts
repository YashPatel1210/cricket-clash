import { Delivery } from "../delivery";

export class Over {
  public constructor(private readonly deliveries: ReadonlyArray<Delivery>) {
    this.validate();
  }

  private validate(): void {
    if (this.legalBallCount() > 6) {
      throw new Error("An over cannot contain more than six legal deliveries.");
    }
  }

  public getDeliveries(): ReadonlyArray<Delivery> {
    return this.deliveries;
  }

  public legalBallCount(): number {
    return this.deliveries.filter((delivery) => delivery.getEvent().isLegal())
      .length;
  }

  public isCompleted(): boolean {
    return this.legalBallCount() === 6;
  }

  public afterDelivery(delivery: Delivery): Over {
    return new Over([...this.deliveries, delivery]);
  }
}
