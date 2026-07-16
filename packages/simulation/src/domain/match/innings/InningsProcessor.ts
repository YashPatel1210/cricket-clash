import { Delivery } from "../delivery";
import { DeliveryOutcome } from "../delivery/DeliveryOutcome";

import { Innings } from "./Innings";

export class InningsProcessor {
  public process(innings: Innings, delivery: Delivery): Innings {
    const outcome = delivery.getEvent().getOutcome();
    const deliveryRuns = delivery.runs();
    const isWicket = delivery.isWicket();

    // ── Score ──────────────────────────────────────────────────────────
    let score = innings.getScore().afterRuns(deliveryRuns).afterBall();

    // ── Batting pair (auto-swap on odd runs) ───────────────────────────
    let battingPair = innings.getBattingPair().afterRuns(deliveryRuns);

    // ── Batting order ─────────────────────────────────────────────────
    let battingOrder = innings.getBattingOrder();

    // ── Bowling attack (advance spell + quota tracking) ────────────────
    const bowlingAttack = innings.getBowlingAttack().afterDelivery(delivery);

    // ── Statistics ────────────────────────────────────────────────────
    const striker = innings.getBattingPair().getStriker();
    const bowler = innings.getBowlingSpell().getBowler();
    let statistics = innings.getStatistics();

    const isFour = outcome === DeliveryOutcome.FOUR;
    const isSix = outcome === DeliveryOutcome.SIX;

    const updatedBatterRecord = statistics
      .getBatterRecord(striker)
      .afterDelivery(deliveryRuns, isFour, isSix);
    statistics = statistics.withBatterRecord(updatedBatterRecord);

    const updatedBowlerRecord = statistics
      .getBowlerRecord(bowler)
      .afterDelivery(deliveryRuns, isWicket);
    statistics = statistics.withBowlerRecord(updatedBowlerRecord);

    // ── Partnership ───────────────────────────────────────────────────
    let partnership = innings.getPartnership().afterDelivery(deliveryRuns);

    // ── Wicket handling ───────────────────────────────────────────────
    if (isWicket) {
      score = score.afterWicket();

      const dismissedBatterRecord = statistics
        .getBatterRecord(striker)
        .dismissed();
      statistics = statistics.withBatterRecord(dismissedBatterRecord);

      if (score.getWickets() < 10) {
        const nextBatter = battingOrder.next();

        battingPair = battingPair.replaceStriker(nextBatter);
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

    if (!updated.hasStarted()) {
      updated = updated.start();
    }

    if (updated.getScore().getWickets() === 10) {
      updated = updated.complete();
    }

    return updated;
  }
}
