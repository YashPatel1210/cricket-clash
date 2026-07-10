import { Player } from "../player";

export class PlayerPool {
  public constructor(
    private readonly players: ReadonlyArray<Player>,
  ) {}

  public size(): number {
    return this.players.length;
  }

  public getPlayers(): ReadonlyArray<Player> {
    return this.players;
  }

  public hasPlayer(playerId: string): boolean {
    return this.players.some(
      (player) => player.id === playerId,
    );
  }
}