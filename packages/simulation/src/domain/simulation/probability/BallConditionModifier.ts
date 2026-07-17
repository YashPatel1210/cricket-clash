import { BowlingStyle } from "@cricket-clash/shared";

import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

export class BallConditionModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    const overs  = ctx.matchContext.getCompletedOvers();
    const style  = ctx.bowler.bowlingStyle;
    const cfg    = ctx.config.ballCondition;

    if (style === null) return dist;

    const isPace = this.isPace(style);
    const isSpin = this.isSpin(style);

    if (overs < cfg.newBallOversMax) {
      return isPace ? applyAdjustments(dist, cfg.newBall.pace)
           : isSpin ? applyAdjustments(dist, cfg.newBall.spin)
           : dist;
    }

    if (overs < cfg.flatPhaseOversMax) {
      return isPace ? applyAdjustments(dist, cfg.flatPhase.pace)
           : isSpin ? applyAdjustments(dist, cfg.flatPhase.spin)
           : dist;
    }

    // Old ball
    return isPace ? applyAdjustments(dist, cfg.oldBall.pace)
         : isSpin ? applyAdjustments(dist, cfg.oldBall.spin)
         : dist;
  }

  private isPace(s: BowlingStyle) {
    return s === BowlingStyle.RIGHT_ARM_FAST || s === BowlingStyle.LEFT_ARM_FAST ||
           s === BowlingStyle.RIGHT_ARM_MEDIUM || s === BowlingStyle.LEFT_ARM_MEDIUM;
  }

  private isSpin(s: BowlingStyle) {
    return s === BowlingStyle.RIGHT_ARM_OFF_SPIN || s === BowlingStyle.LEFT_ARM_ORTHODOX ||
           s === BowlingStyle.RIGHT_ARM_LEG_SPIN  || s === BowlingStyle.LEFT_ARM_WRIST_SPIN;
  }
}
