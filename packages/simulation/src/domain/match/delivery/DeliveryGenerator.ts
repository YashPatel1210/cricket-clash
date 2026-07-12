import { RandomGenerator } from "../../../infrastructure/random";

import { Innings } from "../innings";

import { Delivery } from "./Delivery";
import { DeliveryEvent } from "./DeliveryEvent";
import { DeliveryOutcome } from "./DeliveryOutcome";

export class DeliveryGenerator {
  public constructor(private readonly random: RandomGenerator) {}

  public generate(innings: Innings): Delivery {
    const outcome = this.random.pick([
      DeliveryOutcome.DOT,
      DeliveryOutcome.ONE,
      DeliveryOutcome.TWO,
      DeliveryOutcome.THREE,
      DeliveryOutcome.FOUR,
      DeliveryOutcome.SIX,
      DeliveryOutcome.WICKET,
    ]);

    return new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      this.createEvent(outcome),
    );
  }

  private createEvent(outcome: DeliveryOutcome): DeliveryEvent {
    switch (outcome) {
      case DeliveryOutcome.DOT:
        return new DeliveryEvent(outcome, 0, true);

      case DeliveryOutcome.ONE:
        return new DeliveryEvent(outcome, 1, true);

      case DeliveryOutcome.TWO:
        return new DeliveryEvent(outcome, 2, true);

      case DeliveryOutcome.THREE:
        return new DeliveryEvent(outcome, 3, true);

      case DeliveryOutcome.FOUR:
        return new DeliveryEvent(outcome, 4, true);

      case DeliveryOutcome.SIX:
        return new DeliveryEvent(outcome, 6, true);

      case DeliveryOutcome.WICKET:
        return new DeliveryEvent(outcome, 0, true);

      default:
        throw new Error("Unsupported delivery outcome.");
    }
  }
}
