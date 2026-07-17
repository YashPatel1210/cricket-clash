import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class MatchConditionsModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const pitch   = ctx.matchContext.getPitchType();
    const weather = ctx.matchContext.getWeatherCondition();
    const cfg     = ctx.config;

    let result = dist;
    const pitchAdj   = cfg.pitch[pitch];
    const weatherAdj = cfg.weather[weather];
    if (pitchAdj)   result = applyAdjustments(result, pitchAdj);
    if (weatherAdj) result = applyAdjustments(result, weatherAdj);
    return result;
  }
}
