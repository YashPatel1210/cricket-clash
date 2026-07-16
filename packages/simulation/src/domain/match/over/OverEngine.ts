import { DeliveryGenerator } from "../delivery/DeliveryGenerator";
import { Target } from "../target";

import { Innings, InningsProcessor, InningsStateEvaluator } from "../innings";

import { Over } from "./Over";
import { OverResult } from "./OverResult";

export class OverEngine {
  public constructor(
    private readonly deliveryGenerator: DeliveryGenerator,
    private readonly inningsProcessor: InningsProcessor,
    private readonly inningsStateEvaluator: InningsStateEvaluator,
  ) {}

  public simulate(innings: Innings, target?: Target): OverResult {
    let currentInnings = innings;
    let over = new Over([]);

    while (
      !over.isCompleted() &&
      this.inningsStateEvaluator.shouldContinue(currentInnings, target)
    ) {
      const delivery = this.deliveryGenerator.generate(currentInnings, target);

      currentInnings = this.inningsProcessor.process(currentInnings, delivery);

      over = over.afterDelivery(delivery);
    }

    // After a completed over:
    // 1. Rotate strike (non-striker becomes striker)
    // 2. Rotate bowling attack (next eligible bowler takes over)
    if (over.isCompleted()) {
      currentInnings = currentInnings
        .withBattingPair(currentInnings.getBattingPair().swapStrike())
        .withBowlingAttack(currentInnings.getBowlingAttack().afterOver());
    }

    return new OverResult(over, currentInnings);
  }
}
