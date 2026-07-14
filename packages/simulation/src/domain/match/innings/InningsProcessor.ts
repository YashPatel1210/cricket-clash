import { Delivery } from "../delivery";

import { Innings } from "./Innings";

export class InningsProcessor {
  public process(innings: Innings, delivery: Delivery): Innings {
    let score = innings.getScore().afterRuns(delivery.runs()).afterBall();

    let battingPair = innings.getBattingPair().afterRuns(delivery.runs());

    let battingOrder = innings.getBattingOrder();

    const bowlingSpell = innings.getBowlingSpell().afterDelivery(delivery);

    if (delivery.isWicket()) {
      score = score.afterWicket();

      if (score.getWickets() < 10) {
        const nextBatter = battingOrder.next();

        battingPair = battingPair.replaceStriker(nextBatter);

        battingOrder = battingOrder.afterNext();
      }
    }

    return innings
      .withScore(score)
      .withBattingPair(battingPair)
      .withBowlingSpell(bowlingSpell)
      .withBattingOrder(battingOrder);
  }
}
