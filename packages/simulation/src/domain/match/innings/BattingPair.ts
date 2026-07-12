import { Player } from "../../player";

export class BattingPair {
  public constructor(
    private readonly striker: Player,
    private readonly nonStriker: Player,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.striker === this.nonStriker) {
      throw new Error("Striker and non-striker must be different players.");
    }
  }

  public getStriker(): Player {
    return this.striker;
  }

  public getNonStriker(): Player {
    return this.nonStriker;
  }

  public swapStrike(): BattingPair {
    return new BattingPair(this.nonStriker, this.striker);
  }
  public afterRuns(runs: number): BattingPair {
    return runs % 2 === 1 ? this.swapStrike() : this;
  }
  public replaceStriker(batter: Player): BattingPair {
    return new BattingPair(batter, this.nonStriker);
  }
}
