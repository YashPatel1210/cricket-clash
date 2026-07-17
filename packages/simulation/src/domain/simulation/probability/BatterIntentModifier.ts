import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class BatterIntentModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const intent = ctx.intent.getBatterIntent();
    const adj    = ctx.config.batterIntent[intent];
    return adj ? applyAdjustments(dist, adj) : dist;
  }
}
