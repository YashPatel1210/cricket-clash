import { Player } from "../../player";

export class BowlerRecord {
  public constructor(
    private readonly bowler: Player,
    private readonly balls: number = 0,
    private readonly runs: number = 0,
    private readonly wickets: number = 0,
  ) {}

  public getBowler(): Player {
    return this.bowler;
  }

  public getBalls(): number {
    return this.balls;
  }

  public getRuns(): number {
    return this.runs;
  }

  public getWickets(): number {
    return this.wickets;
  }

  public getOvers(): string {
    const overs = Math.floor(this.balls / 6);
    const remainder = this.balls % 6;
    return `${overs}.${remainder}`;
  }

  public getEconomy(): number {
    const overs = this.balls / 6;
    if (overs === 0) return 0;
    return this.runs / overs;
  }

  public afterDelivery(runs: number, isWicket: boolean): BowlerRecord {
    return new BowlerRecord(
      this.bowler,
      this.balls + 1,
      this.runs + runs,
      this.wickets + (isWicket ? 1 : 0),
    );
  }
}
