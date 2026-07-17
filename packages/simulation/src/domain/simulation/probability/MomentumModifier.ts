import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class MomentumModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    if (ctx.matchContext.getCompletedOvers() === 0) return dist;

    const runs = ctx.matchContext.getLastOverRuns();
    const cfg  = ctx.config.momentum;

    if (runs >= cfg.thresholds.veryHigh) return applyAdjustments(dist, cfg.veryHigh);
    if (runs >= cfg.thresholds.high)     return applyAdjustments(dist, cfg.high);
    if (runs <= cfg.thresholds.veryLow)  return applyAdjustments(dist, cfg.veryLow);
    if (runs <= cfg.thresholds.low)      return applyAdjustments(dist, cfg.low);
    return dist;
  }
}
