import { InningsPhase } from "../configuration/InningsPhase";
import { PitchType } from "../conditions/PitchType";
import { WeatherCondition } from "../conditions/WeatherCondition";
import { BoundarySize } from "../conditions/BoundarySize";
import { Score } from "../score/Score";
import { Target } from "../target/Target";

import { Partnership } from "./Partnership";

/**
 * MatchContext — complete situational awareness at the moment of every delivery.
 *
 * Single source of truth for the Intent Engine and Probability Engine modifiers.
 *
 * Sprint 7 additions:
 *   - ballsSinceLastWicket   wicket-clustering detection
 *   - bowlerSpellBalls       current bowler's balls in this spell (fatigue)
 *   - boundarySize           venue dimensions
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
    private readonly pressureIndex: number,
    private readonly lastOverRuns: number,
    private readonly strikerBattingPosition: number,
    private readonly ballsSinceLastWicket: number,
    private readonly bowlerSpellBalls: number,
    private readonly boundarySize: BoundarySize,
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
    ballsSinceLastWicket: number;
    bowlerSpellBalls: number;
    boundarySize: BoundarySize;
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
      params.ballsSinceLastWicket,
      params.bowlerSpellBalls,
      params.boundarySize,
    );
  }

  // ── Core getters ─────────────────────────────────────────────────

  public getScore(): Score                         { return this.score; }
  public getPhase(): InningsPhase                  { return this.phase; }
  public getCompletedOvers(): number               { return this.completedOvers; }
  public getBallsRemaining(): number               { return this.ballsRemaining; }
  public getWicketsRemaining(): number             { return this.wicketsRemaining; }
  public getCurrentRunRate(): number               { return this.currentRunRate; }
  public getRequiredRunRate(): number | undefined  { return this.requiredRunRate; }
  public getTarget(): Target | undefined           { return this.target; }
  public getPartnership(): Partnership             { return this.partnership; }
  public getStrikerBallsFaced(): number            { return this.strikerBallsFaced; }
  public getPitchType(): PitchType                 { return this.pitchType; }
  public getWeatherCondition(): WeatherCondition   { return this.weatherCondition; }
  public getPressureIndex(): number                { return this.pressureIndex; }
  public getLastOverRuns(): number                 { return this.lastOverRuns; }
  public getStrikerBattingPosition(): number       { return this.strikerBattingPosition; }
  public getBallsSinceLastWicket(): number         { return this.ballsSinceLastWicket; }
  public getBowlerSpellBalls(): number             { return this.bowlerSpellBalls; }
  public getBoundarySize(): BoundarySize           { return this.boundarySize; }

  public isFirstInnings(): boolean  { return this.firstInnings; }
  public isNewBatter(): boolean     { return this.strikerBallsFaced < 8; }
  public isChasing(): boolean       { return !this.firstInnings; }

  // ── Pressure helpers ─────────────────────────────────────────────

  public isHighPressure(): boolean   { return this.pressureIndex >= 0.65; }
  public isMediumPressure(): boolean {
    return this.pressureIndex >= 0.35 && this.pressureIndex < 0.65;
  }
  public isLowPressure(): boolean    { return this.pressureIndex < 0.2; }

  // ── Momentum helpers ─────────────────────────────────────────────

  public isHighMomentum(): boolean { return this.lastOverRuns >= 14; }
  public isLowMomentum(): boolean  { return this.lastOverRuns <= 3; }

  // ── Batting position helpers ─────────────────────────────────────

  public isTailOrder(): boolean {
    return this.strikerBattingPosition >= 9;
  }

  public isLowerMiddleOrder(): boolean {
    return this.strikerBattingPosition >= 7 && this.strikerBattingPosition <= 8;
  }

  // ── Wicket clustering helpers ─────────────────────────────────────

  /** Wicket fell within the last 3 legal balls — batter just arrived */
  public isVeryRecentWicket(): boolean { return this.ballsSinceLastWicket <= 3; }

  /** Wicket fell within the last 12 legal balls — team still unsettled */
  public isRecentWicket(): boolean     { return this.ballsSinceLastWicket <= 12; }
}
