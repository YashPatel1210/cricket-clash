import { Player } from "../../player";
import { MatchContext } from "../context/MatchContext";

import { BatterIntentResolver } from "./BatterIntentResolver";
import { BowlerIntentResolver } from "./BowlerIntentResolver";
import { DeliveryIntent } from "./DeliveryIntent";

/**
 * Orchestrates batter and bowler intent resolution for each delivery.
 *
 * The resulting DeliveryIntent is consumed by the ProbabilityEngine
 * to adjust outcome distributions before random selection.
 */
export class IntentEngine {
  public constructor(
    private readonly batterResolver: BatterIntentResolver,
    private readonly bowlerResolver: BowlerIntentResolver,
  ) {}

  public resolve(
    context: MatchContext,
    striker: Player,
    bowler: Player,
  ): DeliveryIntent {
    const batterIntent = this.batterResolver.resolve(context, striker);
    const bowlerIntent = this.bowlerResolver.resolve(context, bowler);

    return new DeliveryIntent(batterIntent, bowlerIntent);
  }
}
