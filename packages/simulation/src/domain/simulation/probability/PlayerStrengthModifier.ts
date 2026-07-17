import { BowlingStyle } from "@cricket-clash/shared";

import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";
import { Player } from "../../player";
import { effectiveBatting, effectiveBowling } from "../../player/PlayerAttributes";
import { InningsPhase } from "../../match/configuration/InningsPhase";

import { ModifierContext } from "./ModifierContext";
import { OutcomeModifier } from "./OutcomeModifier";
import { applyAdjustments } from "./applyAdjustments";

/**
 * PlayerStrengthModifier
 *
 * Adjusts distribution based on player quality using the expanded
 * PlayerAttributes (against-pace, against-spin, death-hitting, etc).
 *
 * A batting rating of 0.5 = average (no adjustment).
 * Above 0.5 = better than average → more boundaries, fewer wickets.
 * Below 0.5 = weaker → more wickets, fewer boundaries.
 */
export class PlayerStrengthModifier implements OutcomeModifier {
  public modify(dist: OutcomeDistribution, ctx: ModifierContext): OutcomeDistribution {
    let result = dist;
    result = this.applyBatterStrength(result, ctx);
    result = this.applyBowlerStrength(result, ctx);
    return result;
  }

  private applyBatterStrength(
    dist: OutcomeDistribution,
    ctx: ModifierContext,
  ): OutcomeDistribution {
    const phase   = ctx.matchContext.getPhase();
    const bowler  = ctx.bowler;
    const isPace  = this.isPace(bowler.bowlingStyle);
    const isSpin  = this.isSpin(bowler.bowlingStyle);

    const effective = effectiveBatting(ctx.striker.attributes, {
      isPaceBowler:  isPace,
      isSpinBowler:  isSpin,
      isDeathOvers:  phase === InningsPhase.DEATH_OVERS,
      isPowerplay:   phase === InningsPhase.POWERPLAY,
    });

    const modifier = (effective / 99) - 0.5;
    const cfg      = ctx.config.playerStrength.batting;

    return applyAdjustments(dist, {
      dot:    -Math.round(modifier * cfg.maxDotReduction),
      four:    Math.round(modifier * cfg.maxBoundaryIncrease),
      six:     Math.round(modifier * cfg.maxSixIncrease),
      wicket: -Math.round(modifier * cfg.maxWicketReduction),
    });
  }

  private applyBowlerStrength(
    dist: OutcomeDistribution,
    ctx: ModifierContext,
  ): OutcomeDistribution {
    const phase    = ctx.matchContext.getPhase();
    const isNewBall = phase === InningsPhase.POWERPLAY;

    const effective = effectiveBowling(ctx.bowler.attributes, {
      isDeathOvers: phase === InningsPhase.DEATH_OVERS,
      isPowerplay:  isNewBall,
    });

    const modifier = (effective / 99) - 0.5;
    const cfg      = ctx.config.playerStrength.bowling;

    return applyAdjustments(dist, {
      dot:    Math.round(modifier * cfg.maxDotIncrease),
      four:  -Math.round(modifier * cfg.maxBoundaryReduction),
      wicket: Math.round(modifier * cfg.maxWicketIncrease),
    });
  }

  private isPace(s: BowlingStyle | null): boolean {
    return s === BowlingStyle.RIGHT_ARM_FAST || s === BowlingStyle.LEFT_ARM_FAST ||
           s === BowlingStyle.RIGHT_ARM_MEDIUM || s === BowlingStyle.LEFT_ARM_MEDIUM;
  }

  private isSpin(s: BowlingStyle | null): boolean {
    return s === BowlingStyle.RIGHT_ARM_OFF_SPIN  || s === BowlingStyle.LEFT_ARM_ORTHODOX ||
           s === BowlingStyle.RIGHT_ARM_LEG_SPIN   || s === BowlingStyle.LEFT_ARM_WRIST_SPIN;
  }
}
