import { InningsPhase } from "../configuration/InningsPhase";
import { PitchType } from "../conditions/PitchType";
import { WeatherCondition } from "../conditions/WeatherCondition";
import { Score } from "../score/Score";
import { Target } from "../target/Target";

import { Partnership } from "./Partnership";

/**
 * MatchContext is an immutable value object representing the complete
 * situational awareness at the moment of every delivery.
 *
 * It is the single source of truth for the Intent Engine and
 * Probability Engine modifiers.
 *
 * Sprint 6 additions:
 *   - pressureIndex     0–1 computed from RRR differential + wickets
 *   - lastOverRuns      runs scored in the previous completed over
 *   - strikerBattingPosition  approximate batting position (1–11) of current striker
 */
export class MatchContext {
  private constructor(
    private readonly score: Score,
    private readonly phase: InningsPhase,
    private readonly completedOvers: number,
    private readonly ballsRemaining: number,
    private readonly wicketsRemaining: number,
    private readonly currentRunRate: number,
    private readonly requiredRunRate: number | undefined,
    private readonly target: Target | undefined,
    private readonly partnership: Partnership,
    private readonly strikerBallsFaced: number,
    private readonly pitchType: PitchType,
    private readonly weatherCondition: WeatherCondition,
    private readonly firstInnings: boolean,
    // ── Sprint 6 ──────────────────────────────────────────────────────────
    private readonly pressureIndex: number,
    private readonly lastOverRuns: number,
    private readonly strikerBattingPosition: number,
  ) {}

  public static create(params: {
    score: Score;
    phase: InningsPhase;
    completedOvers: number;
    ballsRemaining: number;
    wicketsRemaining: number;
    currentRunRate: number;
    requiredRunRate?: number;
    target?: Target;
    partnership: Partnership;
    strikerBallsFaced: number;
    pitchType: PitchType;
    weatherCondition: WeatherCondition;
    isFirstInnings: boolean;
    pressureIndex: number;
    lastOverRuns: number;
    strikerBattingPosition: number;
  }): MatchContext {
    return new MatchContext(
      params.score,
      params.phase,
      params.completedOvers,
      params.ballsRemaining,
      params.wicketsRemaining,
      params.currentRunRate,
      params.requiredRunRate,
      params.target,
      params.partnership,
      params.strikerBallsFaced,
      params.pitchType,
      params.weatherCondition,
      params.isFirstInnings,
      params.pressureIndex,
      params.lastOverRuns,
      params.strikerBattingPosition,
    );
  }

  // ── Original getters ──────────────────────────────────────────────────

  public getScore(): Score { return this.score; }
  public getPhase(): InningsPhase { return this.phase; }
  public getCompletedOvers(): number { return this.completedOvers; }
  public getBallsRemaining(): number { return this.ballsRemaining; }
  public getWicketsRemaining(): number { return this.wicketsRemaining; }
  public getCurrentRunRate(): number { return this.currentRunRate; }
  public getRequiredRunRate(): number | undefined { return this.requiredRunRate; }
  public getTarget(): Target | undefined { return this.target; }
  public getPartnership(): Partnership { return this.partnership; }
  public getStrikerBallsFaced(): number { return this.strikerBallsFaced; }
  public getPitchType(): PitchType { return this.pitchType; }
  public getWeatherCondition(): WeatherCondition { return this.weatherCondition; }

  public isFirstInnings(): boolean { return this.firstInnings; }
  public isNewBatter(): boolean { return this.strikerBallsFaced < 8; }
  public isChasing(): boolean { return !this.firstInnings; }

  // ── Sprint 6 getters ──────────────────────────────────────────────────

  /**
   * Normalised pressure index (0 = no pressure, 1 = maximum pressure).
   *
   * First innings: driven by over progress + wickets lost.
   * Second innings: driven by RRR differential + wickets lost + balls remaining.
   */
  public getPressureIndex(): number { return this.pressureIndex; }

  /**
   * Runs scored in the last completed over.
   * 0 if no over has been completed yet (start of innings).
   */
  public getLastOverRuns(): number { return this.lastOverRuns; }

  /**
   * Approximate batting position of the current striker (1–11).
   * Derived from wickets fallen: positions 8–11 indicate tail-end batters.
   */
  public getStrikerBattingPosition(): number { return this.strikerBattingPosition; }

  public isHighPressure(): boolean { return this.pressureIndex >= 0.65; }
  public isMediumPressure(): boolean {
    return this.pressureIndex >= 0.35 && this.pressureIndex < 0.65;
  }
  public isLowPressure(): boolean { return this.pressureIndex < 0.2; }

  public isHighMomentum(): boolean { return this.lastOverRuns >= 14; }
  public isLowMomentum(): boolean { return this.lastOverRuns <= 3; }

  public isTailOrder(): boolean { return this.strikerBattingPosition >= 9; }
  public isLowerMiddleOrder(): boolean {
    return this.strikerBattingPosition >= 7 && this.strikerBattingPosition <= 8;
  }
}
