import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class PartnershipModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const balls = ctx.matchContext.getPartnership().getBalls();
    const cfg   = ctx.config.partnership;

    if (balls >= cfg.thresholds.dominant)    return applyAdjustments(dist, cfg.dominant);
    if (balls >= cfg.thresholds.established) return applyAdjustments(dist, cfg.established);
    if (balls <= cfg.thresholds.fresh)       return applyAdjustments(dist, cfg.fresh);
    return dist;
  }
}
