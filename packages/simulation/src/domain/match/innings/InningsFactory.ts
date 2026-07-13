import { Score } from "../score";

import { InningsOrder } from "../InningsOrder";

import { BattingOrder } from "./BattingOrder";
import { BattingPair } from "./BattingPair";
import { BowlingSpell } from "./BowlingSpell";
import { DefaultOpeningBowlerSelector } from "./DefaultOpeningBowlerSelector";
import { DefaultOpeningPairSelector } from "./DefaultOpeningPairSelector";
import { Innings } from "./Innings";
import { OpeningBowlerSelector } from "./OpeningBowlerSelector";
import { OpeningPairSelector } from "./OpeningPairSelector";

export class InningsFactory {
  public constructor(
    private readonly openingPairSelector: OpeningPairSelector = new DefaultOpeningPairSelector(),
    private readonly openingBowlerSelector: OpeningBowlerSelector = new DefaultOpeningBowlerSelector(),
  ) {}

  public create(order: InningsOrder): Innings {
    const battingTeam = order.getBattingTeam();

    const bowlingTeam = order.getBowlingTeam();

    const openingPair = this.openingPairSelector.select(battingTeam);

    const openingBowler = this.openingBowlerSelector.select(bowlingTeam);

    const battingOrder = new BattingOrder(battingTeam.battingOrder().slice(2));

    return new Innings(
      battingTeam,
      bowlingTeam,
      new Score(0, 0, 0),
      new BattingPair(openingPair[0], openingPair[1]),
      new BowlingSpell(openingBowler, 0),
      battingOrder,
    );
  }
}
