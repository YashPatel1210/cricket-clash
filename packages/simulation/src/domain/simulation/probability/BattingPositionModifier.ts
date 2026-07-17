import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class BattingPositionModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const cfg      = ctx.config.battingPosition;
    const isNew    = ctx.matchContext.getStrikerBallsFaced() < cfg.newBatterThreshold;
    if (!isNew) return dist;

    const pos = ctx.matchContext.getStrikerBattingPosition();
    if (pos >= cfg.tailOrderThreshold)       return applyAdjustments(dist, cfg.tailOrder);
    if (pos >= cfg.lowerMiddleThreshold)     return applyAdjustments(dist, cfg.lowerMiddle);
    return dist;
  }
}
