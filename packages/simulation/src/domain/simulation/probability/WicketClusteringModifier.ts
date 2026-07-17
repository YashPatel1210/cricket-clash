import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

/**
 * WicketClusteringModifier
 *
 * In real cricket, wickets cluster. When a wicket falls, the incoming
 * batter is vulnerable and the bowling team has momentum. Two or three
 * wickets in quick succession are a genuine phenomenon (collapses).
 *
 * This modifier increases wicket probability in the deliveries immediately
 * after a wicket falls, then gradually returns to baseline.
 *
 * Very recent (0-3 balls since wicket): brand new batter, maximum vulnerability
 * Recent (4-12 balls since wicket): still unsettled, elevated risk
 */
export class WicketClusteringModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const cfg = ctx.config.wicketClustering;

    if (ctx.matchContext.isVeryRecentWicket()) {
      return applyAdjustments(dist, cfg.veryRecent);
    }

    if (ctx.matchContext.isRecentWicket()) {
      return applyAdjustments(dist, cfg.recent);
    }

    return dist;
  }
}
