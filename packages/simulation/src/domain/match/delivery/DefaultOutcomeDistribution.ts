import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { OutcomeWeight } from "./OutcomeWeight";
import { SimulationConfig } from "../../simulation/config/SimulationConfig";
import { T20TuningProfile } from "../../simulation/config/T20TuningProfile";

/**
 * Builds the base outcome distribution from SimulationConfig.baseWeights.
 *
 * This means base probabilities are tunable without code changes:
 * load a different profile and the entire simulation recalibrates.
 */
export class DefaultOutcomeDistribution {
  private readonly distribution: OutcomeDistribution;

  public constructor(config: SimulationConfig = T20TuningProfile) {
    const w = config.baseWeights;
    this.distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT,    w.dot),
      new OutcomeWeight(DeliveryOutcome.ONE,    w.one),
      new OutcomeWeight(DeliveryOutcome.TWO,    w.two),
      new OutcomeWeight(DeliveryOutcome.THREE,  w.three),
      new OutcomeWeight(DeliveryOutcome.FOUR,   w.four),
      new OutcomeWeight(DeliveryOutcome.SIX,    w.six),
      new OutcomeWeight(DeliveryOutcome.WICKET, w.wicket),
      new OutcomeWeight(DeliveryOutcome.RUN_OUT,w.runOut),
      new OutcomeWeight(DeliveryOutcome.WIDE,   w.wide),
      new OutcomeWeight(DeliveryOutcome.NO_BALL,w.noBall),
      new OutcomeWeight(DeliveryOutcome.BYE,    w.bye),
      new OutcomeWeight(DeliveryOutcome.LEG_BYE,w.legBye),
    ]);
  }

  public getDistribution(): OutcomeDistribution {
    return this.distribution;
  }
}
