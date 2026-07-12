import { DeliveryGenerator } from "../delivery/DeliveryGenerator";
import { Innings, InningsProcessor, InningsStateEvaluator } from "../innings";

import { Over } from "./Over";
import { OverResult } from "./OverResult";

export class OverEngine {
  public constructor(
    private readonly deliveryGenerator: DeliveryGenerator,
    private readonly inningsProcessor: InningsProcessor,
    private readonly inningsStateEvaluator: InningsStateEvaluator,
  ) {}

  public simulate(innings: Innings): OverResult {
    let currentInnings = innings;
    let over = new Over([]);

    while (
      !over.isCompleted() &&
      this.inningsStateEvaluator.shouldContinue(currentInnings)
    ) {
      const delivery = this.deliveryGenerator.generate(currentInnings);

      currentInnings = this.inningsProcessor.process(currentInnings, delivery);

      over = over.afterDelivery(delivery);
    }

    return new OverResult(over, currentInnings);
  }
}
