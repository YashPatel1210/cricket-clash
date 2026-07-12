import { Player } from "../../player";

export class BowlingSpell {
  public constructor(
    private readonly bowler: Player,
    private readonly ballsBowled: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.ballsBowled < 0) {
      throw new Error("Balls bowled cannot be negative.");
    }
  }

  public getBowler(): Player {
    return this.bowler;
  }

  public getBallsBowled(): number {
    return this.ballsBowled;
  }

  public getOversBowled(): string {
    const overs = Math.floor(this.ballsBowled / 6);

    const balls = this.ballsBowled % 6;

    return `${overs}.${balls}`;
  }

  public afterBall(): BowlingSpell {
    return new BowlingSpell(this.bowler, this.ballsBowled + 1);
  }
}
