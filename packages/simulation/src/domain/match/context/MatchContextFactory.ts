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
    const rules = this.configuration.getRules();
    const score = innings.getScore();

    const completedOvers = Math.floor(score.getBalls() / rules.getBallsPerOver());
    const maximumBalls = rules.getMaximumBalls();
    const ballsRemaining = Math.max(0, maximumBalls - score.getBalls());
    const wicketsRemaining = 10 - score.getWickets();

    const oversCompleted = score.getBalls() / rules.getBallsPerOver();
    const currentRunRate = oversCompleted > 0 ? score.getRuns() / oversCompleted : 0;

    let requiredRunRate: number | undefined;
    if (target && !isFirstInnings) {
      const runsNeeded = target.score() - score.getRuns();
      const oversRemaining = ballsRemaining / rules.getBallsPerOver();
      requiredRunRate = oversRemaining > 0 ? runsNeeded / oversRemaining : Infinity;
    }

    const phase = rules.getInningsPhases().phaseAt(completedOvers);

    const striker = innings.getBattingPair().getStriker();
    const statistics: InningsStatistics = innings.getStatistics();
    const strikerBallsFaced = statistics.getBatterRecord(striker).getBalls();

    return MatchContext.create({
      score,
      phase,
      completedOvers,
      ballsRemaining,
      wicketsRemaining,
      currentRunRate: Math.round(currentRunRate * 100) / 100,
      requiredRunRate:
        requiredRunRate !== undefined
          ? Math.round(requiredRunRate * 100) / 100
          : undefined,
      target,
      partnership: innings.getPartnership(),
      strikerBallsFaced,
      pitchType: this.conditions.getPitch(),
      weatherCondition: this.conditions.getWeather(),
      isFirstInnings,
    });
  }
}
