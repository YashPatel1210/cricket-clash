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
    );
  }

  public getScore(): Score {
    return this.score;
  }

  public getPhase(): InningsPhase {
    return this.phase;
  }

  public getCompletedOvers(): number {
    return this.completedOvers;
  }

  public getBallsRemaining(): number {
    return this.ballsRemaining;
  }

  public getWicketsRemaining(): number {
    return this.wicketsRemaining;
  }

  public getCurrentRunRate(): number {
    return this.currentRunRate;
  }

  public getRequiredRunRate(): number | undefined {
    return this.requiredRunRate;
  }

  public getTarget(): Target | undefined {
    return this.target;
  }

  public getPartnership(): Partnership {
    return this.partnership;
  }

  public getStrikerBallsFaced(): number {
    return this.strikerBallsFaced;
  }

  public getPitchType(): PitchType {
    return this.pitchType;
  }

  public getWeatherCondition(): WeatherCondition {
    return this.weatherCondition;
  }

  public isFirstInnings(): boolean {
    return this.firstInnings;
  }

  public isNewBatter(): boolean {
    return this.strikerBallsFaced < 8;
  }

  public isChasing(): boolean {
    return !this.firstInnings;
  }
}
