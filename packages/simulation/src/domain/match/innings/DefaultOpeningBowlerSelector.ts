import { PlayerRole } from "@cricket-clash/shared";

import { Player } from "../../player";
import { Team } from "../../team";

import { OpeningBowlerSelector } from "./OpeningBowlerSelector";

export class DefaultOpeningBowlerSelector implements OpeningBowlerSelector {
  public select(team: Team): Player {
    const bowler = team
      .getPlayers()
      .find(
        (player) =>
          player.role === PlayerRole.BOWLER ||
          player.role === PlayerRole.ALL_ROUNDER,
      );

    if (!bowler) {
      throw new Error("A team must contain at least one bowler.");
    }

    return bowler;
  }
}
