import { Player } from "../player";

export class PlayingXI {
  constructor(
    private readonly players: ReadonlyArray<Player>,
  ) {}

  public getPlayers(): ReadonlyArray<Player> {
    return this.players;
  }

  public size(): number {
    return this.players.length;
  }
}