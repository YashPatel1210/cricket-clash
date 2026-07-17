import { PlayerRole } from "@cricket-clash/shared";

import { BattingPosition } from "./BattingPosition";

/**
 * PositionRange defines the valid batting positions for each player role.
 *
 * These ranges encode real cricket batting conventions:
 *
 *   BATTER        → 1–7  (top order specialists, no lower than 7)
 *   WICKET_KEEPER → 1–7  (keepers bat in top/middle order)
 *   ALL_ROUNDER   → 4–9  (middle/lower order flexibility)
 *   BOWLER        → 7–11 (lower order, tail-enders)
 *
 * A player CANNOT be placed outside their range:
 *   - Bumrah (BOWLER) cannot bat at #1
 *   - Kohli (BATTER) cannot bat at #11
 *   - Maxwell (ALL_ROUNDER) cannot bat at #1 or #10
 */
export class PositionRange {
  private constructor(
    public readonly min: number,
    public readonly max: number,
  ) {}

  private static readonly RANGES: Record<PlayerRole, PositionRange> = {
    [PlayerRole.BATTER]:        new PositionRange(1, 6),
    [PlayerRole.WICKET_KEEPER]: new PositionRange(1, 6),
    [PlayerRole.ALL_ROUNDER]:   new PositionRange(4, 8),
    [PlayerRole.BOWLER]:        new PositionRange(7, 11),
  };

  public static forRole(role: PlayerRole): PositionRange {
    return PositionRange.RANGES[role];
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
