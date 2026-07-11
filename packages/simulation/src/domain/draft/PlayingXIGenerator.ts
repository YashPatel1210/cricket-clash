import { Player } from "../player";
import { DraftOption } from "./DraftOption";
import { PlayingXI } from "./PlayingXI";

export class PlayingXIGenerator {
  public generate(
    players: ReadonlyArray<Player>,
  ): PlayingXI {
    if (players.length < 11) {
      throw new Error(
        "At least 11 players are required.",
      );
    }

    const options = players
      .slice(0, 11)
      .map(player => new DraftOption(player));

    return new PlayingXI(options);
  }
}