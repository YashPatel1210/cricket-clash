export class BowlingSimulationProfile {
  public constructor(
    private readonly maxDotIncrease: number,
    private readonly maxBoundaryReduction: number,
    private readonly maxWicketIncrease: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (
      this.maxDotIncrease < 0 ||
      this.maxBoundaryReduction < 0 ||
      this.maxWicketIncrease < 0
    ) {
      throw new Error("Bowling simulation profile values cannot be negative.");
    }
  }

  public getMaxDotIncrease(): number {
    return this.maxDotIncrease;
  }

  public getMaxBoundaryReduction(): number {
    return this.maxBoundaryReduction;
  }

  public getMaxWicketIncrease(): number {
    return this.maxWicketIncrease;
  }
}
