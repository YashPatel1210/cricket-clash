import { BatterIntent } from "./BatterIntent";
import { BowlerIntent } from "./BowlerIntent";

/**
 * Container for the combined intent of both participants on a delivery.
 */
export class DeliveryIntent {
  public constructor(
    private readonly batter: BatterIntent,
    private readonly bowler: BowlerIntent,
  ) {}

  public getBatterIntent(): BatterIntent {
    return this.batter;
  }

  public getBowlerIntent(): BowlerIntent {
    return this.bowler;
  }
}
