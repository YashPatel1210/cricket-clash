import { RandomGenerator } from "../../../infrastructure/random";

import { Innings } from "../innings";

import { Delivery } from "./Delivery";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";
import { DeliveryEventFactory } from "./DeliveryEventFactory";
import { OutcomeSelector } from "./OutcomeSelector";

export class DeliveryGenerator {
  private readonly outcomeSelector: OutcomeSelector;

  public constructor(
    random: RandomGenerator,
    private readonly eventFactory: DeliveryEventFactory = new DeliveryEventFactory(),
    outcomeSelector?: OutcomeSelector,
  ) {
    this.outcomeSelector =
      outcomeSelector ??
      new OutcomeSelector(random, new DefaultOutcomeDistribution().create());
  }

  public generate(innings: Innings): Delivery {
    const outcome = this.outcomeSelector.select();

    const event = this.eventFactory.create(outcome);

    return new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      event,
    );
  }
}
