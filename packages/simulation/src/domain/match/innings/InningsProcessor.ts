import { Delivery } from "../delivery";
import { Score } from "../score";

import { Innings } from "./Innings";
import { BattingPair } from "./BattingPair";
import { BattingOrder } from "./BattingOrder";
import { BowlingAttack } from "./BowlingAttack";

export class InningsProcessor {
  public process(innings: Innings, delivery: Delivery): Innings {
    let score = innings.getScore().afterRuns(delivery.runs()).afterBall();

    let battingPair = innings.getBattingPair().afterRuns(delivery.runs());

    let battingOrder = innings.getBattingOrder();

    const bowlingAttack = innings.getBowlingAttack().afterBall();

    if (delivery.isWicket()) {
      score = score.afterWicket();

      if (score.getWickets() < 10) {
        const nextBatter = battingOrder.next();

        battingPair = battingPair.replaceStriker(nextBatter);

        battingOrder = battingOrder.afterNext();
      }
    }

    return new Innings(
      innings.getBattingTeam(),
      innings.getBowlingTeam(),
      score,
      battingPair,
      bowlingAttack,
      battingOrder,
    );
  }
}
