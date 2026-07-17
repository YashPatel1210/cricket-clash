import { SimulationConfig } from "../config/SimulationConfig";
import { T20TuningProfile } from "../config/T20TuningProfile";

import { BatterIntentModifier } from "./BatterIntentModifier";
import { BowlerIntentModifier } from "./BowlerIntentModifier";
import { InningsPhaseModifier } from "./InningsPhaseModifier";
import { MatchConditionsModifier } from "./MatchConditionsModifier";
import { PlayerStrengthModifier } from "./PlayerStrengthModifier";
import { ProbabilityEngine } from "./ProbabilityEngine";
import { PressureModifier } from "./PressureModifier";
import { MomentumModifier } from "./MomentumModifier";
import { BattingPositionModifier } from "./BattingPositionModifier";
import { PartnershipModifier } from "./PartnershipModifier";
import { BallConditionModifier } from "./BallConditionModifier";
import { WicketClusteringModifier } from "./WicketClusteringModifier";
import { BowlerFatigueModifier } from "./BowlerFatigueModifier";
import { GroundSizeModifier } from "./GroundSizeModifier";

/**
 * Creates the ProbabilityEngine with the full 13-modifier pipeline.
 *
 * All weights are driven by SimulationConfig — pass a custom config
 * to tune the simulation without changing any code.
 *
 * Modifier layers (execution order):
 *
 *   Foundation:    PlayerStrength | InningsPhase | MatchConditions | BallCondition
 *   Venue:         GroundSize
 *   Situational:   Pressure | Momentum | Partnership | BattingPosition
 *   Clustering:    WicketClustering | BowlerFatigue
 *   Intent:        BatterIntent | BowlerIntent
 */
export class DefaultProbabilityEngineFactory {
  public static create(_config?: SimulationConfig): ProbabilityEngine {
    // All modifiers read config from ModifierContext at runtime —
    // no need to pass config here.
    return new ProbabilityEngine([
      // ── Foundation ────────────────────────────────────────────────
      new PlayerStrengthModifier(),
      new InningsPhaseModifier(),
      new MatchConditionsModifier(),
      new BallConditionModifier(),
      // ── Venue ─────────────────────────────────────────────────────
      new GroundSizeModifier(),
      // ── Situational intelligence ──────────────────────────────────
      new PressureModifier(),
      new MomentumModifier(),
      new PartnershipModifier(),
      new BattingPositionModifier(),
      // ── Clustering & fatigue ──────────────────────────────────────
      new WicketClusteringModifier(),
      new BowlerFatigueModifier(),
      // ── Intent ────────────────────────────────────────────────────
      new BatterIntentModifier(),
      new BowlerIntentModifier(),
    ]);
  }
}
