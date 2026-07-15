import { InningsPhase } from "../configuration/InningsPhase";

export class DeliveryContext {
  public constructor(private readonly inningsPhase: InningsPhase) {}

  public getInningsPhase(): InningsPhase {
    return this.inningsPhase;
  }
}
