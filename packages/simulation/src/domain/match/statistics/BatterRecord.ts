import { Player } from "../../player";

export class BatterRecord {
  public constructor(
    private readonly batter: Player,
    private readonly runs: number = 0,
    private readonly balls: number = 0,
    private readonly fours: number = 0,
    private readonly sixes: number = 0,
    private readonly out: boolean = false,
  ) {}

  public getBatter(): Player {
    return this.batter;
  }

  public getRuns(): number {
    return this.runs;
  }

  public getBalls(): number {
    return this.balls;
  }

  public getFours(): number {
    return this.fours;
  }

  public getSixes(): number {
    return this.sixes;
  }

  public isOut(): boolean {
    return this.out;
  }

  public getStrikeRate(): number {
    if (this.balls === 0) return 0;
    return (this.runs / this.balls) * 100;
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
    );
  }

  public dismissed(): BatterRecord {
    return new BatterRecord(
      this.batter,
      this.runs,
      this.balls,
      this.fours,
      this.sixes,
      true,
    );
  }
}
