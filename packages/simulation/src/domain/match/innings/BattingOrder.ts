import { Player } from "../../player";

export class BattingOrder {
  public constructor(private readonly players: ReadonlyArray<Player>) {}

  public next(): Player {
    if (this.players.length === 0) {
      throw new Error("No batters remaining.");
    }

    return this.players[0];
  }

  public afterNext(): BattingOrder {
    if (this.players.length === 0) {
      return this;
    }

    return new BattingOrder(this.players.slice(1));
  }

  public remaining(): ReadonlyArray<Player> {
    return this.players;
  }

  public isCompleted(): boolean {
    return this.players.length === 0;
  }
}
