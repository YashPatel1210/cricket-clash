import { Player } from "../../player";

export class BowlingOrder {
  public constructor(
    private readonly bowlers: ReadonlyArray<Player>,
    private readonly currentIndex = 0,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.bowlers.length === 0) {
      throw new Error("Bowling order must contain at least one bowler.");
    }

    if (this.currentIndex < 0 || this.currentIndex >= this.bowlers.length) {
      throw new Error("Current bowler index is out of range.");
    }
  }

  public current(): Player {
    return this.bowlers[this.currentIndex];
  }

  public next(): BowlingOrder {
    const nextIndex = (this.currentIndex + 1) % this.bowlers.length;

    return new BowlingOrder(this.bowlers, nextIndex);
  }

  public getBowlers(): ReadonlyArray<Player> {
    return this.bowlers;
  }
}
