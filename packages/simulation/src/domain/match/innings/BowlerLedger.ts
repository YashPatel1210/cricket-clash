import { Player } from "../../player";

/**
 * Tracks cumulative balls bowled per bowler across an innings.
 *
 * Used by BowlingAttack to enforce over quotas (e.g. max 4 overs in T20).
 */
export class BowlerLedger {
  private constructor(
    private readonly ballsByBowler: ReadonlyMap<string, number>,
  ) {}

  public static empty(): BowlerLedger {
    return new BowlerLedger(new Map());
  }

  public getBallsFor(bowler: Player): number {
    return this.ballsByBowler.get(bowler.id) ?? 0;
  }

  public getOversFor(bowler: Player): number {
    return Math.floor(this.getBallsFor(bowler) / 6);
  }

  public hasReachedQuota(bowler: Player, maxBalls: number): boolean {
    return this.getBallsFor(bowler) >= maxBalls;
  }

  public withBalls(bowler: Player, additionalBalls: number): BowlerLedger {
    const current = this.getBallsFor(bowler);
    const updated = new Map(this.ballsByBowler);
    updated.set(bowler.id, current + additionalBalls);
    return new BowlerLedger(updated);
  }
}
