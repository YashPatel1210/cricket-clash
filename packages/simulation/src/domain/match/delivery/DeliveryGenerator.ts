import { RandomGenerator } from "../../../infrastructure/random";

import { IntentEngine } from "../../match/intent/IntentEngine";
import { MatchContextFactory } from "../../match/context/MatchContextFactory";
import { ModifierContext } from "../../simulation/probability/ModifierContext";
import { ProbabilityEngine } from "../../simulation/probability/ProbabilityEngine";
import { SimulationConfig } from "../../simulation/config/SimulationConfig";
import { T20TuningProfile } from "../../simulation/config/T20TuningProfile";

import { Innings } from "../innings";
import { Target } from "../target";

import { Delivery } from "./Delivery";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";
import { DeliveryEventFactory } from "./DeliveryEventFactory";
import { DeliveryOutcome } from "./DeliveryOutcome";
import { DismissalTypeResolver } from "./DismissalTypeResolver";
import { OutcomeSelector } from "./OutcomeSelector";

export class DeliveryGenerator {
  private readonly outcomeSelector: OutcomeSelector;
  private readonly defaultDistribution: DefaultOutcomeDistribution;
  private readonly dismissalTypeResolver: DismissalTypeResolver;

  public constructor(
    private readonly random: RandomGenerator,
    private readonly contextFactory: MatchContextFactory,
    private readonly intentEngine: IntentEngine,
    private readonly probabilityEngine: ProbabilityEngine,
    private readonly config: SimulationConfig = T20TuningProfile,
    private readonly eventFactory: DeliveryEventFactory = new DeliveryEventFactory(),
    outcomeSelector?: OutcomeSelector,
  ) {
    this.outcomeSelector       = outcomeSelector ?? new OutcomeSelector(random);
    this.dismissalTypeResolver = new DismissalTypeResolver(random);
    this.defaultDistribution   = new DefaultOutcomeDistribution(config);
  }

  public generate(innings: Innings, target?: Target): Delivery {
    const striker = innings.getBattingPair().getStriker();
    const bowler  = innings.getBowlingSpell().getBowler();

    const isFirstInnings = target === undefined;
    const context = this.contextFactory.build(innings, target, isFirstInnings);
    const intent  = this.intentEngine.resolve(context, striker, bowler);

    const modCtx = new ModifierContext(context, striker, bowler, intent, this.config);
    const distribution = this.probabilityEngine.calculate(
      this.defaultDistribution.getDistribution(),
      modCtx,
    );

    const outcome = this.outcomeSelector.select(distribution);

    const dismissalType =
      outcome === DeliveryOutcome.WICKET
        ? this.dismissalTypeResolver.resolve(bowler.bowlingStyle, context)
        : undefined;

    const event = this.eventFactory.create(outcome, dismissalType);

    return new Delivery(innings.getBowlingSpell(), innings.getBattingPair(), event);
  }
}
