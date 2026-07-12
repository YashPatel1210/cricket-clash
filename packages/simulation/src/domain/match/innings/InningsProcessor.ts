import { Delivery } from "../delivery";
import { Score } from "../score";

import { Innings } from "./Innings";
import { BattingPair } from "./BattingPair";
import { BattingOrder } from "./BattingOrder";
import { BowlingSpell } from "./BowlingSpell";

export class InningsProcessor {
  public process(innings: Innings, delivery: Delivery): Innings {
    let score: Score = innings
      .getScore()
      .afterRuns(delivery.runs())
      .afterBall();

    let battingPair: BattingPair = innings
      .getBattingPair()
      .afterRuns(delivery.runs());

    let battingOrder: BattingOrder = innings.getBattingOrder();

    const bowlingSpell: BowlingSpell = innings.getBowlingSpell().afterBall();

    if (delivery.isWicket()) {
      score = score.afterWicket();

      // Only bring in a new batter if wickets remain.
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
      bowlingSpell,
      battingOrder,
    );
  }
}
