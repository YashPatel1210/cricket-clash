import { PlayerRole } from "@cricket-clash/shared";

import { Team } from "../../team";

import { BowlingOrder } from "./BowlingOrder";
import { BowlingOrderSelector } from "./BowlingOrderSelector";

export class DefaultBowlingOrderSelector implements BowlingOrderSelector {
  public select(team: Team): BowlingOrder {
    const bowlers = team
      .battingOrder()
      .filter(
        (player) =>
          player.role === PlayerRole.BOWLER ||
          player.role === PlayerRole.ALL_ROUNDER,
      );

    return new BowlingOrder(bowlers);
  }
}
