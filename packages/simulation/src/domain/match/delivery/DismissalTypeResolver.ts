import { BowlingStyle } from "@cricket-clash/shared";

import { RandomGenerator } from "../../../infrastructure/random";
import { InningsPhase } from "../configuration/InningsPhase";
import { MatchContext } from "../context/MatchContext";

import { DismissalType } from "./DismissalType";

type WeightedDismissal = { type: DismissalType; weight: number };

/**
 * Resolves a DismissalType probabilistically from match context and bowling style.
 *
 * Real T20 averages: CAUGHT ~50%, BOWLED ~20%, LBW ~15%, RUN_OUT ~7%,
 * STUMPED ~5%, HIT_WICKET ~2%, with context shifting these proportions.
 *
 * Context modifiers:
 *   - Pace bowler:  more BOWLED + LBW (seam movement)
 *   - Spin bowler:  more STUMPED + CAUGHT (edge/stumped down leg)
 *   - Death overs:  more CAUGHT (slog shots skied)
 *   - New batter:   more BOWLED + LBW (wrong line, playing too early)
 *   - Tail-ender:   more BOWLED (playing across the line)
 */
export class DismissalTypeResolver {
  public constructor(private readonly random: RandomGenerator) {}

  public resolve(
    bowlingStyle: BowlingStyle | null,
    context: MatchContext,
  ): DismissalType {
    const weights = this.buildWeights(bowlingStyle, context);
    return this.pick(weights);
  }

  private buildWeights(
    bowlingStyle: BowlingStyle | null,
    context: MatchContext,
  ): WeightedDismissal[] {
    // ── Base distribution ───────────────────────────────────────────
    const weights: WeightedDismissal[] = [
      { type: DismissalType.CAUGHT,      weight: 50 },
      { type: DismissalType.BOWLED,      weight: 20 },
      { type: DismissalType.LBW,         weight: 15 },
      { type: DismissalType.RUN_OUT,     weight: 7  },
      { type: DismissalType.STUMPED,     weight: 5  },
      { type: DismissalType.HIT_WICKET,  weight: 3  },
    ];

    // ── Pace bowler: seam and swing → more BOWLED + LBW ─────────────
    if (this.isPace(bowlingStyle)) {
      this.shift(weights, DismissalType.BOWLED,  +8);
      this.shift(weights, DismissalType.LBW,     +5);
      this.shift(weights, DismissalType.STUMPED, -8);
      this.shift(weights, DismissalType.CAUGHT,  -5);
    }

    // ── Spin bowler: turn and drift → more STUMPED + CAUGHT ──────────
    if (this.isSpin(bowlingStyle)) {
      this.shift(weights, DismissalType.STUMPED, +10);
      this.shift(weights, DismissalType.CAUGHT,  +5);
      this.shift(weights, DismissalType.BOWLED,  -8);
      this.shift(weights, DismissalType.LBW,     -7);
    }

    // ── Death overs: slog shots → more CAUGHT in the deep ────────────
    if (context.getPhase() === InningsPhase.DEATH_OVERS) {
      this.shift(weights, DismissalType.CAUGHT,  +10);
      this.shift(weights, DismissalType.LBW,     -5);
      this.shift(weights, DismissalType.BOWLED,  -5);
    }

    // ── New batter: playing wrong line → more BOWLED + LBW ───────────
    if (context.isNewBatter()) {
      this.shift(weights, DismissalType.BOWLED, +6);
      this.shift(weights, DismissalType.LBW,    +4);
      this.shift(weights, DismissalType.CAUGHT, -10);
    }

    // ── Tail-ender: playing across the line → more BOWLED ────────────
    if (context.isTailOrder()) {
      this.shift(weights, DismissalType.BOWLED, +10);
      this.shift(weights, DismissalType.LBW,    +5);
      this.shift(weights, DismissalType.CAUGHT, -10);
      this.shift(weights, DismissalType.STUMPED, -5);
    }

    return weights;
  }

  private shift(
    weights: WeightedDismissal[],
    type: DismissalType,
    delta: number,
  ): void {
    const entry = weights.find((w) => w.type === type);
    if (entry) entry.weight = Math.max(1, entry.weight + delta);
  }

  private pick(weights: WeightedDismissal[]): DismissalType {
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    let roll = this.random.nextFloat() * total;

    for (const entry of weights) {
      roll -= entry.weight;
      if (roll < 0) return entry.type;
    }

    return weights[weights.length - 1].type;
  }

  private isPace(style: BowlingStyle | null): boolean {
    return (
      style === BowlingStyle.RIGHT_ARM_FAST   ||
      style === BowlingStyle.LEFT_ARM_FAST    ||
      style === BowlingStyle.RIGHT_ARM_MEDIUM ||
      style === BowlingStyle.LEFT_ARM_MEDIUM
    );
  }

  private isSpin(style: BowlingStyle | null): boolean {
    return (
      style === BowlingStyle.RIGHT_ARM_OFF_SPIN  ||
      style === BowlingStyle.LEFT_ARM_ORTHODOX   ||
      style === BowlingStyle.RIGHT_ARM_LEG_SPIN  ||
      style === BowlingStyle.LEFT_ARM_WRIST_SPIN
    );
  }
}
