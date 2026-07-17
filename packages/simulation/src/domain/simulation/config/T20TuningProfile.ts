import { BatterIntent } from "../../match/intent/BatterIntent";
import { BowlerIntent } from "../../match/intent/BowlerIntent";
import { InningsPhase } from "../../match/configuration/InningsPhase";
import { PitchType } from "../../match/conditions/PitchType";
import { WeatherCondition } from "../../match/conditions/WeatherCondition";

import { SimulationConfig } from "./SimulationConfig";

/**
 * T20TuningProfile
 *
 * Calibrated default configuration for T20 cricket.
 *
 * Real T20 statistical targets (from research):
 *   Avg runs:       158  (SD: 30)
 *   Avg wickets:    5.5  per innings
 *   All-out rate:   35%  of innings
 *   Dot rate:       33%  of legal balls
 *   Boundary rate:  22%  of legal balls (4s + 6s)
 *   Extras:         10–15 per innings
 *
 * KEY CALIBRATION PRINCIPLE:
 *   Base WICKET weight is 4 (not 6) to achieve ~35% all-out rate.
 *   All modifier magnitudes are proportionally reduced so that stacking
 *   multiple modifiers does not drive wicket probability above ~15%.
 */
export const T20TuningProfile: SimulationConfig = {

  // ── Base distribution weights (total = 100) ────────────────────────
  baseWeights: {
    dot:    31,   // 31% — realistic T20 dot rate
    one:    25,   // 25%
    two:     9,   //  9%
    three:   1,   //  1%
    four:   13,   // 13%
    six:     6,   //  6%  → total boundary = 19%
    wicket:  4,   //  4% ← KEY: reduced from 6 to achieve 35% all-out rate
    runOut:  1,   //  1%
    wide:    5,   //  5%
    noBall:  2,   //  2%
    bye:     1,   //  1%
    legBye:  2,   //  2%
    // Total: 100
  },

  // ── Innings phases ─────────────────────────────────────────────────
  phase: {
    [InningsPhase.POWERPLAY]: {
      four:   +3,   // Open field = easier boundaries
      six:    +1,
      dot:    -2,
    },
    [InningsPhase.MIDDLE_OVERS]: {
      // Baseline — no adjustment
    },
    [InningsPhase.DEATH_OVERS]: {
      six:    +2,   // Slog overs
      four:   +1,
      wicket: +1,   // Risk increases
      dot:    -1,
    },
  },

  // ── Batter intent ──────────────────────────────────────────────────
  batterIntent: {
    [BatterIntent.DEFEND]: {
      dot:    +6,
      one:    +2,
      wicket: -2,
      four:   -3,
      six:    -3,
    },
    [BatterIntent.ROTATE]: {
      dot:    -2,
      one:    +3,
      wicket: -1,
    },
    [BatterIntent.ATTACK]: {
      four:   +4,
      six:    +1,
      dot:    -3,
      wicket: +1,
    },
    [BatterIntent.ACCELERATE]: {
      six:    +4,
      four:   +3,
      dot:    -4,
      wicket: +2,
    },
  },

  // ── Bowler intent ──────────────────────────────────────────────────
  bowlerIntent: {
    [BowlerIntent.CONTAIN]: {
      dot:    +3,
      four:   -2,
      six:    -1,
    },
    [BowlerIntent.ATTACK]: {
      wicket: +2,
      dot:    +1,
      four:   -1,
    },
    [BowlerIntent.YORKER]: {
      wicket: +3,
      dot:    +4,
      four:   -3,
      six:    -3,
    },
    [BowlerIntent.BOUNCER]: {
      wicket: +1,
      six:    +1,
      dot:    +1,
      four:   -1,
    },
  },

  // ── Pitch conditions ──────────────────────────────────────────────
  pitch: {
    [PitchType.GREEN]: {
      wicket: +2,
      dot:    +2,
      four:   -1,
    },
    [PitchType.FLAT]: {
      // Batting paradise — baseline
    },
    [PitchType.DUSTY]: {
      wicket: +1,
      dot:    +2,
      four:   -1,
      six:    -1,
    },
    [PitchType.DRY]: {
      four:   +1,
      six:    +1,
    },
  },

  // ── Weather ────────────────────────────────────────────────────────
  weather: {
    [WeatherCondition.OVERCAST]: {
      dot:    +2,
      wicket: +1,
    },
    [WeatherCondition.CLOUDY]: {
      dot:    +1,
      wicket: +1,
    },
    [WeatherCondition.SUNNY]: {
      // Baseline
    },
    [WeatherCondition.RAINY]: {
      // Match suspended — not simulated
    },
  },

  // ── Pressure ──────────────────────────────────────────────────────
  pressure: {
    thresholds: { high: 0.65, medium: 0.35, low: 0.2 },
    high: {
      wicket: +3,   // Panic/desperation
      six:    +2,
      four:   +1,
      dot:    -2,
    },
    medium: {
      wicket: +1,
      four:   +1,
      dot:    -1,
    },
    low: {
      wicket: -1,   // Comfortable — technically correct
      dot:    +2,
      one:    +1,
    },
  },

  // ── Momentum ──────────────────────────────────────────────────────
  momentum: {
    thresholds: { veryHigh: 14, high: 11, low: 5, veryLow: 3 },
    veryHigh: {
      four:   +3,
      six:    +1,
      dot:    -2,
      wicket: -1,   // Batting in flow
    },
    high: {
      four:   +1,
      dot:    -1,
    },
    low: {
      dot:    +2,
      wicket: +1,
      four:   -1,
    },
    veryLow: {
      dot:    +4,   // Near maiden — bowling dominant
      wicket: +1,
      four:   -2,
      one:    -1,
    },
  },

  // ── Partnership ───────────────────────────────────────────────────
  partnership: {
    thresholds: { dominant: 56, established: 26, fresh: 8 },
    dominant: {
      wicket: -2,   // Very hard to break
      four:   +2,
      dot:    -1,
    },
    established: {
      wicket: -1,
      four:   +1,
    },
    fresh: {
      wicket: +1,   // New partnership — vulnerable
    },
  },

  // ── Batting position ──────────────────────────────────────────────
  battingPosition: {
    newBatterThreshold: 15,
    tailOrderThreshold: 9,
    lowerMiddleThreshold: 7,
    tailOrder: {
      wicket: +5,   // Genuine tail-enders
      dot:    +4,
      four:   -3,
      six:    -3,
      one:    -1,
    },
    lowerMiddle: {
      wicket: +2,
      dot:    +2,
      four:   -1,
      six:    -1,
    },
  },

  // ── Ball condition ────────────────────────────────────────────────
  ballCondition: {
    newBallOversMax: 6,
    flatPhaseOversMax: 14,
    newBall: {
      pace: { wicket: +2, dot: +1, four: -1 },
      spin: { wicket: -1, four: +1 },
    },
    flatPhase: {
      pace: { four: +1, dot: -1 },
      spin: { wicket: +1, dot: +2, four: -1 },
    },
    oldBall: {
      pace: { wicket: +1 },
      spin: { wicket: +2, dot: +2, four: -1 },
    },
  },

  // ── Player strength scaling ───────────────────────────────────────
  playerStrength: {
    batting: {
      maxDotReduction:    4,
      maxBoundaryIncrease: 3,
      maxSixIncrease:     2,
      maxWicketReduction: 2,
    },
    bowling: {
      maxDotIncrease:       4,
      maxBoundaryReduction: 2,
      maxWicketIncrease:    2,
    },
  },

  // ── Wicket clustering ─────────────────────────────────────────────
  wicketClustering: {
    recentWicketBallThreshold: 12,
    veryRecent: {
      wicket: +2,   // Ball 0–3 after wicket — brand new batter
      dot:    +1,
    },
    recent: {
      wicket: +1,   // Ball 4–12 after wicket — still unsettled
    },
  },

  // ── Bowler fatigue ────────────────────────────────────────────────
  bowlerFatigue: {
    thirdOverThreshold:  12,  // > 12 balls in spell = 3rd over
    fourthOverThreshold: 18,  // > 18 balls in spell = 4th over
    thirdOver: {
      dot:    -1,
      four:   +1,
    },
    fourthOver: {
      dot:    -2,
      four:   +1,
      six:    +1,
    },
  },

  // ── Ground size ───────────────────────────────────────────────────
  groundSize: {
    small: {
      six:    +3,   // Chinnaswamy / Sharjah
      four:   +2,
      dot:    -1,
    },
    medium: {
      // Baseline
    },
    large: {
      six:    -2,   // MCG / Perth
      four:   -1,
      dot:    +1,
    },
  },

  // ── Calibration targets ───────────────────────────────────────────
  calibration: {
    targetAvgRuns:        158,
    targetStdDevRuns:      30,
    targetAvgWickets:       5.5,
    targetAllOutRate:       0.35,
    targetDotRate:          0.33,
    targetBoundaryRate:     0.22,
    targetExtrasPerInnings: 12,
  },
};
