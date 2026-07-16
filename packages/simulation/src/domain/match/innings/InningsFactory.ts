import { Score } from "../score";

import { InningsOrder } from "../InningsOrder";

import { BattingOrder } from "./BattingOrder";
import { BattingPair } from "./BattingPair";
import { BowlingAttack } from "./BowlingAttack";
import { BowlingOrderSelector } from "./BowlingOrderSelector";
import { DefaultBowlingOrderSelector } from "./DefaultBowlingOrderSelector";
import { DefaultOpeningPairSelector } from "./DefaultOpeningPairSelector";
import { Innings } from "./Innings";
import { OpeningPairSelector } from "./OpeningPairSelector";

export class InningsFactory {
  public constructor(
    private readonly openingPairSelector: OpeningPairSelector = new DefaultOpeningPairSelector(),
    private readonly bowlingOrderSelector: BowlingOrderSelector = new DefaultBowlingOrderSelector(),
    private readonly maxBallsPerBowler: number = 24, // T20 default: 4 overs
  ) {}

  public create(order: InningsOrder): Innings {
    const battingTeam = order.getBattingTeam();
    const bowlingTeam = order.getBowlingTeam();

    const openingPair = this.openingPairSelector.select(battingTeam);

    const bowlingOrder = this.bowlingOrderSelector.select(bowlingTeam);

    const battingOrder = new BattingOrder(battingTeam.battingOrder().slice(2));

    return new Innings(
      battingTeam,
      bowlingTeam,
      new Score(0, 0, 0),
      new BattingPair(openingPair[0], openingPair[1]),
      BowlingAttack.create(bowlingOrder, this.maxBallsPerBowler),
      battingOrder,
    );
  }
}
