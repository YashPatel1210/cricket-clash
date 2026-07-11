import { Player } from "../player";

export class PlayerPool {
  public constructor(
    private readonly players: ReadonlyArray<Player>,
  ) {}

  public size(): number {
    return this.players.length;
  }

  public isEmpty(): boolean {
    return this.players.length === 0;
  }

  public getPlayers(): ReadonlyArray<Player> {
    return this.players;
  }

  public hasPlayer(playerId: string): boolean {
    return this.players.some(
      (player) => player.id === playerId,
    );
  }

  public exclude(
    playerIds: ReadonlyArray<string>,
  ): PlayerPool {
    const filteredPlayers = this.players.filter(
      (player) => !playerIds.includes(player.id),
    );

    return new PlayerPool(filteredPlayers);
  }
}