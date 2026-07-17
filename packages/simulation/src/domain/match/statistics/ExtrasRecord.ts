/**
 * Tracks extras conceded in an innings: wides, no-balls, byes, leg-byes.
 *
 * In real cricket:
 *   - Wides and no-balls charged to bowler economy
 *   - Byes and leg-byes are fielding/keeping failures — NOT charged to bowler
 */
export class ExtrasRecord {
  public constructor(
    private readonly wides: number   = 0,
    private readonly noBalls: number = 0,
    private readonly byes: number    = 0,
    private readonly legByes: number = 0,
  ) {}

  public static empty(): ExtrasRecord {
    return new ExtrasRecord();
  }

  public getWides(): number   { return this.wides; }
  public getNoBalls(): number { return this.noBalls; }
  public getByes(): number    { return this.byes; }
  public getLegByes(): number { return this.legByes; }

  public getTotal(): number {
    return this.wides + this.noBalls + this.byes + this.legByes;
  }

  public afterWide(runs: number = 1): ExtrasRecord {
    return new ExtrasRecord(this.wides + runs, this.noBalls, this.byes, this.legByes);
  }

  public afterNoBall(runs: number = 1): ExtrasRecord {
    return new ExtrasRecord(this.wides, this.noBalls + runs, this.byes, this.legByes);
  }

  public afterBye(runs: number): ExtrasRecord {
    return new ExtrasRecord(this.wides, this.noBalls, this.byes + runs, this.legByes);
  }

  public afterLegBye(runs: number): ExtrasRecord {
    return new ExtrasRecord(this.wides, this.noBalls, this.byes, this.legByes + runs);
  }

  /** Short display string, e.g. "w 5, nb 2, b 1, lb 3" */
  public toDisplay(): string {
    const parts: string[] = [];
    if (this.wides   > 0) parts.push(`w ${this.wides}`);
    if (this.noBalls > 0) parts.push(`nb ${this.noBalls}`);
    if (this.byes    > 0) parts.push(`b ${this.byes}`);
    if (this.legByes > 0) parts.push(`lb ${this.legByes}`);
    return parts.length > 0 ? parts.join(", ") : "none";
  }
}
