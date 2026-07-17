import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class PressureModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const pressure = ctx.matchContext.getPressureIndex();
    const cfg      = ctx.config.pressure;

    if (pressure >= cfg.thresholds.high)   return applyAdjustments(dist, cfg.high);
    if (pressure >= cfg.thresholds.medium) return applyAdjustments(dist, cfg.medium);
    if (pressure < cfg.thresholds.low)     return applyAdjustments(dist, cfg.low);
    return dist;
  }
}
