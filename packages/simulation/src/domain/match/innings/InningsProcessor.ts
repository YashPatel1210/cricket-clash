import { Delivery } from "../delivery";
import { DeliveryOutcome } from "../delivery/DeliveryOutcome";
import { DismissalType } from "../delivery/DismissalType";

import { Innings } from "./Innings";

/**
 * InningsProcessor applies a single delivery to the innings state.
 *
 * Rules implemented:
 *   - Wides and no-balls: runs scored, ball NOT advanced (over doesn't progress)
 *   - Byes and leg-byes: ball advanced, runs go to extras (not batter)
 *   - Wides: do NOT count as balls faced by batter
 *   - RUN_OUT: dismissal with NO bowler wicket credit
 *   - WICKET: dismissal WITH bowler wicket credit (all types except RUN_OUT)
 *   - Dismissal: new batter comes in, partnership resets
 *   - Statistics: extras tracked, bowler wides/no-balls tracked separately
 */
export class InningsProcessor {
  public process(innings: Innings, delivery: Delivery): Innings {
    const event    = delivery.getEvent();
    const outcome  = event.getOutcome();
    const isDismissal = event.isDismissal();

    // ── Runs and score advancement ─────────────────────────────────────
    const deliveryRuns  = delivery.runs();
    let   score         = innings.getScore().afterRuns(deliveryRuns);

    // WIDE and NO_BALL are not legal — over ball count does NOT advance
    if (event.isLegal()) {
      score = score.afterBall();
    }

    // ── Batting pair — strike rotation on odd batter runs ─────────────
    // Only swap on ODD batter runs (not bye/leg-bye runs)
    const batterRuns  = event.isBatterRuns() ? deliveryRuns : 0;
    let battingPair   = innings.getBattingPair().afterRuns(batterRuns);

    // ── Batting order ─────────────────────────────────────────────────
    let battingOrder  = innings.getBattingOrder();

    // ── Bowling attack ─────────────────────────────────────────────────
    const bowlingAttack = innings.getBowlingAttack().afterDelivery(delivery);

    // ── Statistics ────────────────────────────────────────────────────
    const striker = innings.getBattingPair().getStriker();
    const bowler  = innings.getBowlingSpell().getBowler();
    let statistics = innings.getStatistics();

    const isFour = outcome === DeliveryOutcome.FOUR;
    const isSix  = outcome === DeliveryOutcome.SIX;

    // Batter record: only update if this counts as a ball faced
    if (event.countAsBallFaced()) {
      const batterRecord = statistics
        .getBatterRecord(striker)
        .afterDelivery(batterRuns, isFour, isSix);
      statistics = statistics.withBatterRecord(batterRecord);
    }

    // Bowler record: update based on delivery type
    if (event.isWide()) {
      const bowlerRecord = statistics.getBowlerRecord(bowler).afterWide(deliveryRuns);
      statistics = statistics.withBowlerRecord(bowlerRecord);
    } else if (event.isNoBall()) {
      const bowlerRecord = statistics.getBowlerRecord(bowler).afterNoBall(deliveryRuns);
      statistics = statistics.withBowlerRecord(bowlerRecord);
    } else {
      // Legal delivery: credit runs to bowler EXCEPT byes/leg-byes
      // (byes/leg-byes are keeping/batting failures, not bowler's fault)
      const bowlerRuns       = (event.isBye() || event.isLegBye()) ? 0 : deliveryRuns;
      const bowlerWicket     = event.isBowlerWicket();
      const bowlerRecord     = statistics
        .getBowlerRecord(bowler)
        .afterDelivery(bowlerRuns, bowlerWicket);
      statistics = statistics.withBowlerRecord(bowlerRecord);
    }

    // Extras record
    let extras = statistics.getExtras();
    if (event.isWide())    extras = extras.afterWide(deliveryRuns);
    if (event.isNoBall())  extras = extras.afterNoBall(deliveryRuns);
    if (event.isBye())     extras = extras.afterBye(deliveryRuns);
    if (event.isLegBye())  extras = extras.afterLegBye(deliveryRuns);
    statistics = statistics.withExtras(extras);

    // ── Partnership ───────────────────────────────────────────────────
    let partnership = innings.getPartnership();
    if (event.isLegal()) {
      partnership = partnership.afterDelivery(batterRuns);
    }

    // ── Dismissal handling ────────────────────────────────────────────
    if (isDismissal) {
      score = score.afterWicket();

      // Attribute dismissal to batter record with dismissal type
      const dismissalType = event.getDismissalType() ?? DismissalType.CAUGHT;
      const bowlerName    = event.isBowlerWicket() ? bowler.name : undefined;
      const dismissedBatterRecord = statistics
        .getBatterRecord(striker)
        .dismissed(dismissalType, bowlerName);
      statistics = statistics.withBatterRecord(dismissedBatterRecord);

      if (score.getWickets() < 10) {
        const nextBatter = battingOrder.next();
        battingPair  = battingPair.replaceStriker(nextBatter);
        battingOrder = battingOrder.afterNext();
      }

      partnership = partnership.reset();
    }

    // ── Assemble updated innings ───────────────────────────────────────
    let updated = innings
      .withScore(score)
      .withBattingPair(battingPair)
      .withBowlingAttack(bowlingAttack)
      .withBattingOrder(battingOrder)
      .withStatistics(statistics)
      .withPartnership(partnership);

    if (!updated.hasStarted()) updated = updated.start();

    if (updated.getScore().getWickets() === 10) updated = updated.complete();

    return updated;
  }
}
