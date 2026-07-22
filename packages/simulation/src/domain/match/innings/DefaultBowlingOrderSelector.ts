import { Team } from "../../team";

import { BowlingOrder } from "./BowlingOrder";
import { BowlingOrderSelector } from "./BowlingOrderSelector";

export class DefaultBowlingOrderSelector implements BowlingOrderSelector {
  public select(team: Team): BowlingOrder {
    // Use literal strings — avoids ESM static init issues with PlayerRole enum
    const bowlers = team
      .battingOrder()
      .filter(
        (player) =>
          (player.role as string) === "BOWLER" ||
          (player.role as string) === "ALL_ROUNDER",
      );

    return new BowlingOrder(bowlers);
  }
}
