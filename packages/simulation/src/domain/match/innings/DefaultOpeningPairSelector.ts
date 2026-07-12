import { Player } from "../../player";
import { Team } from "../../team";

import { OpeningPairSelector } from "./OpeningPairSelector";

export class DefaultOpeningPairSelector implements OpeningPairSelector {
  public select(team: Team): readonly [Player, Player] {
    const battingOrder = team.battingOrder();

    if (battingOrder.length < 2) {
      throw new Error("Team requires at least two players.");
    }

    return [battingOrder[0], battingOrder[1]];
  }
}
