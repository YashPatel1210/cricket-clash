import { RandomGenerator } from "../../../infrastructure/random";

import { IntentEngine } from "../../match/intent/IntentEngine";
import { MatchContextFactory } from "../../match/context/MatchContextFactory";
import { ModifierContext } from "../../simulation/probability/ModifierContext";
import { ProbabilityEngine } from "../../simulation/probability/ProbabilityEngine";

import { Innings } from "../innings";
import { Target } from "../target";

import { Delivery } from "./Delivery";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";
import { DeliveryEventFactory } from "./DeliveryEventFactory";
import { OutcomeSelector } from "./OutcomeSelector";

/**
 * Generates a Delivery by running the full simulation pipeline:
 *
 *   MatchContext → Intent → Probability → Outcome → DeliveryEvent → Delivery
 *
 * This replaces the previous model of direct distribution influencers
 * with a context-aware, intent-driven pipeline.
 */
export class DeliveryGenerator {
  private readonly outcomeSelector: OutcomeSelector;
  private readonly defaultDistribution = new DefaultOutcomeDistribution();

  public constructor(
    random: RandomGenerator,
    private readonly contextFactory: MatchContextFactory,
    private readonly intentEngine: IntentEngine,
    private readonly probabilityEngine: ProbabilityEngine,
    private readonly eventFactory: DeliveryEventFactory = new DeliveryEventFactory(),
    outcomeSelector?: OutcomeSelector,
  ) {
    this.outcomeSelector = outcomeSelector ?? new OutcomeSelector(random);
  }

  public generate(innings: Innings, target?: Target): Delivery {
    const striker = innings.getBattingPair().getStriker();
    const bowler = innings.getBowlingSpell().getBowler();

    // Stage 1: Build match context
    const isFirstInnings = target === undefined;
    const context = this.contextFactory.build(innings, target, isFirstInnings);

    // Stage 2: Determine intent
    const intent = this.intentEngine.resolve(context, striker, bowler);

    // Stage 3: Calculate probability distribution
    const modifierContext = new ModifierContext(context, striker, bowler, intent);
    const distribution = this.probabilityEngine.calculate(
      this.defaultDistribution.getDistribution(),
      modifierContext,
    );

    // Stage 4: Select outcome (deterministic randomness)
    const outcome = this.outcomeSelector.select(distribution);

    // Stage 5: Create delivery event
    const event = this.eventFactory.create(outcome);

    return new Delivery(innings.getBowlingSpell(), innings.getBattingPair(), event);
  }
}
