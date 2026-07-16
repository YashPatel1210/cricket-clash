export class Partnership {
  public constructor(
    private readonly runs: number = 0,
    private readonly balls: number = 0,
  ) {}

  public static empty(): Partnership {
    return new Partnership(0, 0);
  }

  public getRuns(): number {
    return this.runs;
  }

  public getBalls(): number {
    return this.balls;
  }

  public afterDelivery(runs: number): Partnership {
    return new Partnership(this.runs + runs, this.balls + 1);
  }

  public reset(): Partnership {
    return Partnership.empty();
  }
}
