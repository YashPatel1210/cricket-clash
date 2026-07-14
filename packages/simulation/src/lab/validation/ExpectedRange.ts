export class ExpectedRange {
  public constructor(
    private readonly minimum: number,
    private readonly maximum: number,
  ) {
    if (minimum > maximum) {
      throw new Error("Minimum value cannot be greater than maximum value.");
    }
  }

  public getMinimum(): number {
    return this.minimum;
  }

  public getMaximum(): number {
    return this.maximum;
  }

  public contains(value: number): boolean {
    return value >= this.minimum && value <= this.maximum;
  }
}
