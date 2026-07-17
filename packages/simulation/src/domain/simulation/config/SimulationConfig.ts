import { BatterIntent } from "../../match/intent/BatterIntent";
import { BowlerIntent } from "../../match/intent/BowlerIntent";
import { InningsPhase } from "../../match/configuration/InningsPhase";
import { PitchType } from "../../match/conditions/PitchType";
import { WeatherCondition } from "../../match/conditions/WeatherCondition";

import { OutcomeAdjustments } from "./OutcomeAdjustments";

/**
 * SimulationConfig — the single source of truth for all simulation weights.
 *
 * Every modifier reads its adjustment values from this config instead of
 * having hardcoded numbers. This enables:
 *
 *   1. AI-tuning based on real cricket dataset statistics
 *   2. Format-specific configs (T20 vs ODI vs Test)
 *   3. Experimentation without touching any code
 *   4. JSON serialisation for persistence and sharing
 *
 * The default T20 config is in T20TuningProfile.
 */
export interface SimulationConfig {

  // ── Base distribution weights (total must equal 100) ──────────────
  baseWeights: {
    dot: number;
    one: number;
    two: number;
    three: number;
    four: number;
    six: number;
    wicket: number;
    runOut: number;
    wide: number;
    noBall: number;
    bye: number;
    legBye: number;
  };

  // ── Innings phase ──────────────────────────────────────────────────
  phase: Record<InningsPhase, OutcomeAdjustments>;

  // ── Batter and bowler intent ───────────────────────────────────────
  batterIntent: Record<BatterIntent, OutcomeAdjustments>;
  bowlerIntent: Record<BowlerIntent, OutcomeAdjustments>;

  // ── Match conditions ───────────────────────────────────────────────
  pitch: Record<PitchType, OutcomeAdjustments>;
  weather: Record<WeatherCondition, OutcomeAdjustments>;

  // ── Pressure ──────────────────────────────────────────────────────
  pressure: {
    thresholds: { high: number; medium: number; low: number };
    high: OutcomeAdjustments;
    medium: OutcomeAdjustments;
    low: OutcomeAdjustments;
  };

  // ── Momentum (last over runs) ─────────────────────────────────────
  momentum: {
    thresholds: { veryHigh: number; high: number; low: number; veryLow: number };
    veryHigh: OutcomeAdjustments;
    high: OutcomeAdjustments;
    low: OutcomeAdjustments;
    veryLow: OutcomeAdjustments;
  };

  // ── Partnership ────────────────────────────────────────────────────
  partnership: {
    thresholds: { dominant: number; established: number; fresh: number };
    dominant: OutcomeAdjustments;
    established: OutcomeAdjustments;
    fresh: OutcomeAdjustments;
  };

  // ── Batting position (tail-ender penalty) ─────────────────────────
  battingPosition: {
    newBatterThreshold: number;      // balls faced before vulnerability ends
    tailOrderThreshold: number;      // position >= this = tail
    lowerMiddleThreshold: number;    // position >= this = lower middle
    tailOrder: OutcomeAdjustments;
    lowerMiddle: OutcomeAdjustments;
  };

  // ── Ball condition ─────────────────────────────────────────────────
  ballCondition: {
    newBallOversMax: number;
    flatPhaseOversMax: number;
    // Adjustments per bowling type per phase
    newBall: { pace: OutcomeAdjustments; spin: OutcomeAdjustments };
    flatPhase: { pace: OutcomeAdjustments; spin: OutcomeAdjustments };
    oldBall: { pace: OutcomeAdjustments; spin: OutcomeAdjustments };
  };

  // ── Player strength scaling ────────────────────────────────────────
  playerStrength: {
    batting: {
      maxDotReduction: number;
      maxBoundaryIncrease: number;
      maxSixIncrease: number;
      maxWicketReduction: number;
    };
    bowling: {
      maxDotIncrease: number;
      maxBoundaryReduction: number;
      maxWicketIncrease: number;
    };
  };

  // ── Wicket clustering ──────────────────────────────────────────────
  wicketClustering: {
    recentWicketBallThreshold: number;  // balls since last wicket to be "recent"
    recent: OutcomeAdjustments;         // unsettled batting team
    veryRecent: OutcomeAdjustments;     // ball 0-3 since wicket (brand new batter)
  };

  // ── Bowler fatigue ────────────────────────────────────────────────
  bowlerFatigue: {
    thirdOverThreshold: number;   // spell balls > this = 3rd over
    fourthOverThreshold: number;  // spell balls > this = 4th over
    thirdOver: OutcomeAdjustments;
    fourthOver: OutcomeAdjustments;
  };

  // ── Ground / venue ────────────────────────────────────────────────
  groundSize: {
    small: OutcomeAdjustments;    // < 60m avg boundary (e.g. Chinnaswamy)
    medium: OutcomeAdjustments;   // 60-75m (e.g. Wankhede)
    large: OutcomeAdjustments;    // > 75m (e.g. MCG)
  };

  // ── Calibration targets (for auto-calibration) ───────────────────
  calibration: {
    targetAvgRuns: number;
    targetStdDevRuns: number;
    targetAvgWickets: number;
    targetAllOutRate: number;   // 0.0–1.0
    targetDotRate: number;      // 0.0–1.0
    targetBoundaryRate: number; // 0.0–1.0
    targetExtrasPerInnings: number;
  };
}
