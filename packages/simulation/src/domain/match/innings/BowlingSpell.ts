import { Player } from "../../player";

import { Delivery } from "../delivery";

export class BowlingSpell {
  public constructor(
    private readonly bowler: Player,
    private readonly ballsBowled = 0,
    private readonly runsConceded = 0,
    private readonly wicketsTaken = 0,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.ballsBowled < 0) {
      throw new Error("Balls bowled cannot be negative.");
    }

    if (this.runsConceded < 0) {
      throw new Error("Runs conceded cannot be negative.");
    }

    if (this.wicketsTaken < 0) {
      throw new Error("Wickets taken cannot be negative.");
    }
  }

  public getBowler(): Player {
    return this.bowler;
  }

  public getBallsBowled(): number {
    return this.ballsBowled;
  }

  public getRunsConceded(): number {
    return this.runsConceded;
  }

  public getWicketsTaken(): number {
    return this.wicketsTaken;
  }

  public getOversBowled(): string {
    const overs = Math.floor(this.ballsBowled / 6);
    const balls = this.ballsBowled % 6;

    return `${overs}.${balls}`;
  }

  public afterDelivery(delivery: Delivery): BowlingSpell {
    return new BowlingSpell(
      this.bowler,
      this.ballsBowled + 1,
      this.runsConceded + delivery.runs(),
      this.wicketsTaken + (delivery.isWicket() ? 1 : 0),
    );
  }
}
