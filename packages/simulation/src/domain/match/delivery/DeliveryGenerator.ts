import { RandomGenerator } from "../../../infrastructure/random";

import { BattingDistributionInfluencer } from "../../simulation/influencers/BattingDistributionInfluencer";
import { BowlingDistributionInfluencer } from "../../simulation/influencers/BowlingDistributionInfluencer";
import { DefaultSimulationProfile } from "../../simulation/profiles/DefaultSimulationProfile";

import { Innings } from "../innings";

import { Delivery } from "./Delivery";
import { DefaultOutcomeDistribution } from "./DefaultOutcomeDistribution";
import { DeliveryEventFactory } from "./DeliveryEventFactory";
import { OutcomeSelector } from "./OutcomeSelector";

export class DeliveryGenerator {
  private readonly outcomeSelector: OutcomeSelector;

  private readonly battingInfluencer: BattingDistributionInfluencer;

  private readonly bowlingInfluencer: BowlingDistributionInfluencer;

  private readonly defaultDistribution = new DefaultOutcomeDistribution();

  public constructor(
    random: RandomGenerator,
    private readonly eventFactory: DeliveryEventFactory = new DeliveryEventFactory(),
    outcomeSelector?: OutcomeSelector,
  ) {
    this.outcomeSelector = outcomeSelector ?? new OutcomeSelector(random);

    const simulationProfile = DefaultSimulationProfile.standard();

    this.battingInfluencer = new BattingDistributionInfluencer(
      simulationProfile,
    );

    this.bowlingInfluencer = new BowlingDistributionInfluencer(
      simulationProfile,
    );
  }

  public generate(innings: Innings): Delivery {
    const battingDistribution = this.battingInfluencer.influence(
      innings.getBattingPair().getStriker(),
      this.defaultDistribution.getDistribution(),
    );

    const finalDistribution = this.bowlingInfluencer.influence(
      innings.getBowlingSpell().getBowler(),
      battingDistribution,
    );

    const outcome = this.outcomeSelector.select(finalDistribution);

    const event = this.eventFactory.create(outcome);

    return new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      event,
    );
  }
}
