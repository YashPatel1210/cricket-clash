import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class BowlerIntentModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const intent = ctx.intent.getBowlerIntent();
    const adj    = ctx.config.bowlerIntent[intent];
    return adj ? applyAdjustments(dist, adj) : dist;
  }
}
