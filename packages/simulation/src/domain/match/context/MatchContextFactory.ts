import { MatchConditions } from "../conditions/MatchConditions";
import { MatchConfiguration } from "../configuration/MatchConfiguration";
import { Innings } from "../innings/Innings";
import { Target } from "../target/Target";

import { MatchContext } from "./MatchContext";

/**
 * Builds a MatchContext snapshot from the current live innings state.
 *
 * Injected into DeliveryGenerator so that every delivery begins with
 * a fully populated situational awareness object.
 */
export class MatchContextFactory {
  public constructor(
    private readonly configuration: MatchConfiguration,
    private readonly conditions: MatchConditions,
  ) {}

  public build(
    innings: Innings,
    target?: Target,
    isFirstInnings: boolean = true,
  ): MatchContext {
    const rules  = this.configuration.getRules();
    const score  = innings.getScore();

    const completedOvers  = Math.floor(score.getBalls() / rules.getBallsPerOver());
    const maximumBalls    = rules.getMaximumBalls();
    const ballsRemaining  = Math.max(0, maximumBalls - score.getBalls());
    const wicketsRemaining = 10 - score.getWickets();

    const oversCompleted  = score.getBalls() / rules.getBallsPerOver();
    const currentRunRate  = oversCompleted > 0 ? score.getRuns() / oversCompleted : 0;

    let requiredRunRate: number | undefined;
    if (target && !isFirstInnings) {
      const runsNeeded    = target.score() - score.getRuns();
      const oversRemaining = ballsRemaining / rules.getBallsPerOver();
      requiredRunRate = oversRemaining > 0 ? runsNeeded / oversRemaining : Infinity;
    }

    const phase = rules.getInningsPhases().phaseAt(completedOvers);

    const striker         = innings.getBattingPair().getStriker();
    const strikerBallsFaced = innings.getStatistics().getBatterRecord(striker).getBalls();

    // ── Sprint 6: derived fields ──────────────────────────────────────────
    const pressureIndex = this.computePressureIndex(
      isFirstInnings,
      completedOvers,
      rules.getMaximumOvers(),
      wicketsRemaining,
      ballsRemaining,
      currentRunRate,
      requiredRunRate,
    );

    // Approximate striker batting position from wickets fallen.
    // After n wickets: the newest batter arrived at position n+2.
    // Positions 9–11 are tail-enders.
    const strikerBattingPosition = Math.min(score.getWickets() + 2, 11);

    return MatchContext.create({
      score,
      phase,
      completedOvers,
      ballsRemaining,
      wicketsRemaining,
      currentRunRate:  Math.round(currentRunRate  * 100) / 100,
      requiredRunRate: requiredRunRate !== undefined
        ? Math.round(requiredRunRate * 100) / 100
        : undefined,
      target,
      partnership:     innings.getPartnership(),
      strikerBallsFaced,
      pitchType:       this.conditions.getPitch(),
      weatherCondition: this.conditions.getWeather(),
      isFirstInnings,
      pressureIndex,
      lastOverRuns:    innings.getLastOverRuns(),
      strikerBattingPosition,
    });
  }

  /**
   * Computes a normalised pressure index (0–1).
   *
   * First innings:
   *   Pressure rises as the innings progresses and wickets fall.
   *   Encourages batters to accelerate in the death overs.
   *
   * Second innings (chasing):
   *   Primary driver is the gap between required run rate and current run rate.
   *   Wickets lost and balls remaining amplify the pressure further.
   */
  private computePressureIndex(
    isFirstInnings: boolean,
    completedOvers: number,
    maximumOvers: number,
    wicketsRemaining: number,
    ballsRemaining: number,
    currentRunRate: number,
    requiredRunRate?: number,
  ): number {
    const wicketPressure = (10 - wicketsRemaining) / 10;

    if (!isFirstInnings && requiredRunRate !== undefined) {
      const rrrDelta = Math.max(0, requiredRunRate - currentRunRate)
        / Math.max(currentRunRate, 6);
      const latePressure = ballsRemaining < 24 ? 0.1 : 0;
      const pressure = rrrDelta * 0.55 + wicketPressure * 0.35 + latePressure;
      return Math.min(1, Math.round(pressure * 100) / 100);
    }

    // First innings: over progression + wickets
    const overProgress = completedOvers / maximumOvers;
    const pressure     = overProgress * 0.45 + wicketPressure * 0.35;
    return Math.min(1, Math.round(pressure * 100) / 100);
  }
}
