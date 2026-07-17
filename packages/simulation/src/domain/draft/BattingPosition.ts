/**
 * BattingPosition — a slot in the batting order (1–11).
 *
 * Used as the key in DraftSquad to prevent two players being placed
 * at the same position, and to validate role-position eligibility.
 */
export class BattingPosition {
  private constructor(private readonly value: number) {}

  public static of(n: number): BattingPosition {
    if (n < 1 || n > 11 || !Number.isInteger(n)) {
      throw new Error(`Invalid batting position: ${n}. Must be an integer 1–11.`);
    }
    return new BattingPosition(n);
  }

  /** All 11 valid positions in order. */
  public static all(): ReadonlyArray<BattingPosition> {
    return Array.from({ length: 11 }, (_, i) => BattingPosition.of(i + 1));
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: BattingPosition): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return `#${this.value}`;
  }
}
