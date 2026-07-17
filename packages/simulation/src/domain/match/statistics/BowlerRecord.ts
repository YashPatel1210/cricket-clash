import { Player } from "../../player";

export class BowlerRecord {
  public constructor(
    private readonly bowler: Player,
    private readonly balls: number    = 0,
    private readonly runs: number     = 0,
    private readonly wickets: number  = 0,
    private readonly wides: number    = 0,
    private readonly noBalls: number  = 0,
  ) {}

  public getBowler(): Player   { return this.bowler; }
  public getBalls(): number    { return this.balls; }
  public getRuns(): number     { return this.runs; }
  public getWickets(): number  { return this.wickets; }
  public getWides(): number    { return this.wides; }
  public getNoBalls(): number  { return this.noBalls; }

  public getOvers(): string {
    const overs     = Math.floor(this.balls / 6);
    const remainder = this.balls % 6;
    return `${overs}.${remainder}`;
  }

  public getEconomy(): number {
    const overs = this.balls / 6;
    return overs === 0 ? 0 : this.runs / overs;
  }

  /**
   * Records a legal delivery.
   *
   * @param runs        Runs conceded (includes byes if charged to bowler)
   * @param bowlerWicket True only when bowler earns the wicket (not RUN_OUT)
   */
  public afterDelivery(runs: number, bowlerWicket: boolean): BowlerRecord {
    return new BowlerRecord(
      this.bowler,
      this.balls + 1,
      this.runs + runs,
      this.wickets + (bowlerWicket ? 1 : 0),
      this.wides,
      this.noBalls,
    );
  }

  /** Records a wide — not a legal ball, runs charged to bowler's economy. */
  public afterWide(runs: number = 1): BowlerRecord {
    return new BowlerRecord(
      this.bowler,
      this.balls,        // wides don't count as balls for over purposes
      this.runs + runs,  // but DO hurt economy
      this.wickets,
      this.wides + runs,
      this.noBalls,
    );
  }

  /** Records a no-ball — not a legal ball, runs charged to bowler's economy. */
  public afterNoBall(runs: number = 1): BowlerRecord {
    return new BowlerRecord(
      this.bowler,
      this.balls,
      this.runs + runs,
      this.wickets,
      this.wides,
      this.noBalls + runs,
    );
  }
}
