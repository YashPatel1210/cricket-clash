import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class InningsPhaseModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const phase = ctx.matchContext.getPhase();
    const adj   = ctx.config.phase[phase];
    return adj ? applyAdjustments(dist, adj) : dist;
  }
}
