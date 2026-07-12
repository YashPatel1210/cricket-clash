export class Score {
  public constructor(
    private readonly runs: number,
    private readonly wickets: number,
    private readonly balls: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.runs < 0) {
      throw new Error("Runs cannot be negative.");
    }

    if (this.wickets < 0 || this.wickets > 10) {
      throw new Error("Wickets must be between 0 and 10.");
    }

    if (this.balls < 0) {
      throw new Error("Balls cannot be negative.");
    }
  }

  public getRuns(): number {
    return this.runs;
  }

  public getWickets(): number {
    return this.wickets;
  }

  public getBalls(): number {
    return this.balls;
  }

  public getOvers(): string {
    const completedOvers = Math.floor(this.balls / 6);

    const ballsInCurrentOver = this.balls % 6;

    return `${completedOvers}.${ballsInCurrentOver}`;
  }

  public isAllOut(): boolean {
    return this.wickets === 10;
  }
}
