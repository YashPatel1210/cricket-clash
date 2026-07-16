import { Player } from "../../player";
import { MatchContext } from "../context/MatchContext";
import { DeliveryIntent } from "../intent/DeliveryIntent";

/**
 * Input context passed to every OutcomeModifier in the pipeline.
 *
 * Carries all information a modifier could need to adjust
 * the probability distribution.
 */
export class ModifierContext {
  public constructor(
    public readonly matchContext: MatchContext,
    public readonly striker: Player,
    public readonly bowler: Player,
    public readonly intent: DeliveryIntent,
  ) {}
}
