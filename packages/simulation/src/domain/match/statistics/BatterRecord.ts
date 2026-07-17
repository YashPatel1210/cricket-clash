import { Player } from "../../player";

import { DismissalType } from "../delivery/DismissalType";

export class BatterRecord {
  public constructor(
    private readonly batter: Player,
    private readonly runs: number               = 0,
    private readonly balls: number              = 0,
    private readonly fours: number              = 0,
    private readonly sixes: number              = 0,
    private readonly out: boolean               = false,
    private readonly dismissalType?: DismissalType,
    private readonly dismissedBy?: string,   // bowler name
    private readonly caughtBy?: string,      // fielder name (for CAUGHT)
  ) {}

  public getBatter(): Player        { return this.batter; }
  public getRuns(): number          { return this.runs; }
  public getBalls(): number         { return this.balls; }
  public getFours(): number         { return this.fours; }
  public getSixes(): number         { return this.sixes; }
  public isOut(): boolean           { return this.out; }
  public getDismissalType(): DismissalType | undefined { return this.dismissalType; }

  public getStrikeRate(): number {
    return this.balls === 0 ? 0 : (this.runs / this.balls) * 100;
  }

  /**
   * Returns a proper cricket scorecard dismissal string.
   *
   * Examples:
   *   "b Bumrah"
   *   "c Maxwell b Starc"
   *   "lbw b Cummins"
   *   "st †Wade b Zampa"
   *   "run out (Hazlewood)"
   *   "hit wicket b Cummins"
   *   "not out"
   */
  public getDismissalDisplay(): string {
    if (!this.out) return "not out";

    switch (this.dismissalType) {
      case DismissalType.BOWLED:
        return this.dismissedBy ? `b ${this.dismissedBy}` : "b";

      case DismissalType.CAUGHT:
        if (this.caughtBy && this.dismissedBy) {
          return `c ${this.caughtBy} b ${this.dismissedBy}`;
        }
        return this.dismissedBy ? `c & b ${this.dismissedBy}` : "caught";

      case DismissalType.LBW:
        return this.dismissedBy ? `lbw b ${this.dismissedBy}` : "lbw";

      case DismissalType.STUMPED:
        return this.dismissedBy ? `st b ${this.dismissedBy}` : "stumped";

      case DismissalType.HIT_WICKET:
        return this.dismissedBy ? `hit wicket b ${this.dismissedBy}` : "hit wicket";

      case DismissalType.RUN_OUT:
        return this.caughtBy ? `run out (${this.caughtBy})` : "run out";

      default:
        return "out";
    }
  }

  public afterDelivery(
    runs: number,
    isFour: boolean,
    isSix: boolean,
  ): BatterRecord {
    return new BatterRecord(
      this.batter,
      this.runs + runs,
      this.balls + 1,
      this.fours + (isFour ? 1 : 0),
      this.sixes + (isSix ? 1 : 0),
      this.out,
      this.dismissalType,
      this.dismissedBy,
      this.caughtBy,
    );
  }

  public dismissed(
    type: DismissalType,
    dismissedBy?: string,
    caughtBy?: string,
  ): BatterRecord {
    return new BatterRecord(
      this.batter,
      this.runs,
      this.balls,
      this.fours,
      this.sixes,
      true,
      type,
      dismissedBy,
      caughtBy,
    );
  }
}
