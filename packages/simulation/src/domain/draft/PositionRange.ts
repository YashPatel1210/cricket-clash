import { PlayerRole } from "@cricket-clash/shared";

import { BattingPosition } from "./BattingPosition";

/**
 * PositionRange defines the valid batting positions for each player role.
 *
 * Uses literal string keys (not computed enum keys) to avoid ESM
 * static initialisation order issues in the browser bundle.
 */
export class PositionRange {
  private constructor(
    public readonly min: number,
    public readonly max: number,
  ) {}

  public static readonly RANGES: Record<string, PositionRange> = {
    "BATTER":        new PositionRange(1, 6),
    "WICKET_KEEPER": new PositionRange(1, 6),
    "ALL_ROUNDER":   new PositionRange(4, 8),
    "BOWLER":        new PositionRange(7, 11),
  };

  public static forRole(role: PlayerRole | string): PositionRange {
    const range = PositionRange.RANGES[role as string];
    if (!range) {
      throw new Error(`No position range defined for role: "${role}"`);
    }
    return range;
  }

  /** Returns all BattingPositions valid for this range. */
  public eligiblePositions(): ReadonlyArray<BattingPosition> {
    const positions: BattingPosition[] = [];
    for (let i = this.min; i <= this.max; i++) {
      positions.push(BattingPosition.of(i));
    }
    return positions;
  }

  public includes(position: BattingPosition): boolean {
    return position.getValue() >= this.min && position.getValue() <= this.max;
  }

  public toString(): string {
    return `${this.min}–${this.max}`;
  }
}
