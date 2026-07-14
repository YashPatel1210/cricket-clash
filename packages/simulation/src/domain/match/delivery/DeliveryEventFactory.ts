import { DeliveryEvent } from "./DeliveryEvent";
import { DeliveryOutcome } from "./DeliveryOutcome";

export class DeliveryEventFactory {
  public create(outcome: DeliveryOutcome): DeliveryEvent {
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

      case DeliveryOutcome.WIDE:
        return new DeliveryEvent(outcome, 1, false);

      case DeliveryOutcome.NO_BALL:
        return new DeliveryEvent(outcome, 1, false);

      case DeliveryOutcome.BYE:
        return new DeliveryEvent(outcome, 1, true);

      case DeliveryOutcome.LEG_BYE:
        return new DeliveryEvent(outcome, 1, true);

      case DeliveryOutcome.RUN_OUT:
        return new DeliveryEvent(outcome, 0, true);

      default:
        throw new Error("Unsupported delivery outcome.");
    }
  }
}
