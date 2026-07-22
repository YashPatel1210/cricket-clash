import { Player } from "../../player";
import { Team } from "../../team";

import { OpeningBowlerSelector } from "./OpeningBowlerSelector";

export class DefaultOpeningBowlerSelector implements OpeningBowlerSelector {
  public select(team: Team): Player {
    // Use literal strings — avoids ESM static init issues with PlayerRole enum
    const bowler = team
      .getPlayers()
      .find(
        (player) =>
          (player.role as string) === "BOWLER" ||
          (player.role as string) === "ALL_ROUNDER",
      );

    if (!bowler) {
      throw new Error("A team must contain at least one bowler.");
    }

    return bowler;
  }
}
