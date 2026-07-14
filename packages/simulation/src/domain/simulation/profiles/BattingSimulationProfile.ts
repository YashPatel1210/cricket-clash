export class BattingSimulationProfile {
  public constructor(
    private readonly maxDotReduction: number,
    private readonly maxSingleIncrease: number,
    private readonly maxBoundaryIncrease: number,
    private readonly maxSixIncrease: number,
    private readonly maxWicketReduction: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (
      this.maxDotReduction < 0 ||
      this.maxSingleIncrease < 0 ||
      this.maxBoundaryIncrease < 0 ||
      this.maxSixIncrease < 0 ||
      this.maxWicketReduction < 0
    ) {
      throw new Error("Batting simulation profile values cannot be negative.");
    }
  }

  public getMaxDotReduction(): number {
    return this.maxDotReduction;
  }

  public getMaxSingleIncrease(): number {
    return this.maxSingleIncrease;
  }

  public getMaxBoundaryIncrease(): number {
    return this.maxBoundaryIncrease;
  }

  public getMaxSixIncrease(): number {
    return this.maxSixIncrease;
  }

  public getMaxWicketReduction(): number {
    return this.maxWicketReduction;
  }
}
