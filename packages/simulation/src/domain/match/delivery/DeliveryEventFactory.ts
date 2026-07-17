import { DismissalType } from "./DismissalType";
import { DeliveryEvent } from "./DeliveryEvent";
import { DeliveryOutcome } from "./DeliveryOutcome";

export class DeliveryEventFactory {
  public create(
    outcome: DeliveryOutcome,
    dismissalType?: DismissalType,
  ): DeliveryEvent {
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
        return new DeliveryEvent(outcome, 0, true, dismissalType);

      case DeliveryOutcome.RUN_OUT:
        // Run-outs are dismissals but credit no bowler
        return new DeliveryEvent(outcome, 0, true, DismissalType.RUN_OUT);

      case DeliveryOutcome.WIDE:
        // Not a legal delivery — over does not advance
        return new DeliveryEvent(outcome, 1, false);

      case DeliveryOutcome.NO_BALL:
        // Not a legal delivery — over does not advance
        return new DeliveryEvent(outcome, 1, false);

      case DeliveryOutcome.BYE:
        // Legal delivery — runs go to extras not batter
        return new DeliveryEvent(outcome, 1, true);

      case DeliveryOutcome.LEG_BYE:
        // Legal delivery — runs go to extras not batter
        return new DeliveryEvent(outcome, 1, true);

      default:
        throw new Error(`Unsupported delivery outcome: ${outcome}`);
    }
  }
}
