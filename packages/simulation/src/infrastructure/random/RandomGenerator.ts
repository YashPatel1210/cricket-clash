export class RandomGenerator {
  private state: number;

  public constructor(seed: number) {
    this.state = seed;
  }

  private nextState(): number {
    this.state =
      (this.state * 1664525 + 1013904223) >>> 0;

    return this.state;
  }

  public nextFloat(): number {
    return this.nextState() / 4294967296;
  }

  public nextInt(
    min: number,
    max: number,
  ): number {
    if (min > max) {
      throw new Error(
        "Minimum cannot be greater than maximum.",
      );
    }

    return (
      Math.floor(
        this.nextFloat() * (max - min + 1),
      ) + min
    );
  }

  public pick<T>(
    items: ReadonlyArray<T>,
  ): T {
    if (items.length === 0) {
      throw new Error(
        "Cannot pick from an empty collection.",
      );
    }

    return items[
      this.nextInt(0, items.length - 1)
    ];
  }
}