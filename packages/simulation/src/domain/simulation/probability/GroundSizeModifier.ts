import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { BoundarySize } from "../../match/conditions/BoundarySize";
import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

/**
 * GroundSizeModifier
 *
 * Venue boundary dimensions directly affect how many sixes and fours
 * are scored. A small ground like Chinnaswamy in Bengaluru produces
 * 20-30 more runs per T20 innings than a large ground like the MCG.
 *
 * Small  (< 60m avg) — Chinnaswamy, Sharjah, Eden Gardens
 * Medium (60-75m)    — Wankhede, SCG, Adelaide Oval  [baseline]
 * Large  (> 75m)     — MCG, Perth Stadium, Lord's
 */
export class GroundSizeModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const size = ctx.matchContext.getBoundarySize();
    const cfg  = ctx.config.groundSize;

    switch (size) {
      case BoundarySize.SMALL:  return applyAdjustments(dist, cfg.small);
      case BoundarySize.LARGE:  return applyAdjustments(dist, cfg.large);
      case BoundarySize.MEDIUM:
      default:                  return dist;
    }
  }
}
