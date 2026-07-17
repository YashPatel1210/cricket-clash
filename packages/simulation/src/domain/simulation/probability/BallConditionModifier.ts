import { BowlingStyle } from "@cricket-clash/shared";

import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { DeliveryOutcome } from "../../match/delivery/DeliveryOutcome";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";

/**
 * BallConditionModifier
 *
 * Models how the age and condition of the cricket ball affects the delivery.
 *
 * New ball (overs 1–5):
 *   - Pace bowlers: hard, shiny ball — maximum swing and seam movement.
 *     More wickets and dot balls. Genuine threat.
 *   - Spin bowlers: limited by hard ball surface. Slightly harder to grip.
 *
 * Flat phase (overs 6–13):
 *   - Ball has lost its shine but not yet old enough to reverse.
 *   - Batting-friendly period. Slightly more run-scoring.
 *   - Spin bowlers begin to grip the roughened surface.
 *
 * Old ball / death phase (overs 14–20):
 *   - Pace: reverse swing potential on abrasive pitches.
 *     Unpredictable movement → more wickets for quality pace bowling.
 *   - Spin: ball is dry and rough — maximum spin grip.
 *     Extra turn and bounce → more wickets, more dot balls.
 *
 * Combined with MatchConditionsModifier (pitch/weather), this produces
 * realistic delivery variety across an entire innings.
 */
export class BallConditionModifier implements OutcomeModifier {
  public modify(
    distribution: OutcomeDistribution,
    context: ModifierContext,
  ): OutcomeDistribution {
    const completedOvers = context.matchContext.getCompletedOvers();
    const bowlingStyle   = context.bowler.bowlingStyle;

    if (bowlingStyle === null) return distribution;

    const isPace = this.isPaceBowler(bowlingStyle);
    const isSpin = this.isSpinBowler(bowlingStyle);

    // ── New ball (overs 1–5) ──────────────────────────────────────────
    if (completedOvers < 6) {
      if (isPace) {
        // Maximum swing — pace bowlers at their most dangerous
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +3))
          .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +2))
          .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -1));
      }
      if (isSpin) {
        // Hard ball, harder to grip — spinners slightly less effective
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, -1))
          .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   +1));
      }
    }

    // ── Flat / mid-innings phase (overs 6–13) ────────────────────────
    if (completedOvers >= 6 && completedOvers < 14) {
      if (isSpin) {
        // Roughened surface — spinners now grip the ball
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +2))
          .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +2))
          .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -1));
      }
      // Flat period for pace — slightly batting-friendly
      return distribution
        .withWeight(DeliveryOutcome.FOUR, this.adj(distribution, DeliveryOutcome.FOUR, +1))
        .withWeight(DeliveryOutcome.DOT,  this.adj(distribution, DeliveryOutcome.DOT,  -1));
    }

    // ── Old ball (overs 14–20) ────────────────────────────────────────
    if (completedOvers >= 14) {
      if (isPace) {
        // Reverse swing potential — unpredictable for the batter
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +2))
          .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +1));
      }
      if (isSpin) {
        // Maximum grip and turn on the old rough ball
        return distribution
          .withWeight(DeliveryOutcome.WICKET, this.adj(distribution, DeliveryOutcome.WICKET, +2))
          .withWeight(DeliveryOutcome.DOT,    this.adj(distribution, DeliveryOutcome.DOT,    +3))
          .withWeight(DeliveryOutcome.FOUR,   this.adj(distribution, DeliveryOutcome.FOUR,   -2));
      }
    }

    return distribution;
  }

  private isPaceBowler(style: BowlingStyle): boolean {
    return (
      style === BowlingStyle.RIGHT_ARM_FAST    ||
      style === BowlingStyle.LEFT_ARM_FAST     ||
      style === BowlingStyle.RIGHT_ARM_MEDIUM  ||
      style === BowlingStyle.LEFT_ARM_MEDIUM
    );
  }

  private isSpinBowler(style: BowlingStyle): boolean {
    return (
      style === BowlingStyle.RIGHT_ARM_OFF_SPIN  ||
      style === BowlingStyle.LEFT_ARM_ORTHODOX   ||
      style === BowlingStyle.RIGHT_ARM_LEG_SPIN  ||
      style === BowlingStyle.LEFT_ARM_WRIST_SPIN
    );
  }

  private adj(dist: OutcomeDistribution, o: DeliveryOutcome, delta: number): number {
    return Math.max(1, (dist.getWeightFor(o)?.getWeight() ?? 0) + delta);
  }
}
