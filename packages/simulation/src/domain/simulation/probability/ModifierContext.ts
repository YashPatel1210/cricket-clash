import { Player } from "../../player";
import { MatchContext } from "../context/MatchContext";
import { DeliveryIntent } from "../intent/DeliveryIntent";
import { SimulationConfig } from "../../simulation/config/SimulationConfig";
import { T20TuningProfile } from "../../simulation/config/T20TuningProfile";

/**
 * Input to every OutcomeModifier in the probability pipeline.
 *
 * Carries all information a modifier could need including the full
 * SimulationConfig so no weights are hardcoded inside modifiers.
 */
export class ModifierContext {
  public constructor(
    public readonly matchContext: MatchContext,
    public readonly striker: Player,
    public readonly bowler: Player,
    public readonly intent: DeliveryIntent,
    public readonly config: SimulationConfig = T20TuningProfile,
  ) {}
}
