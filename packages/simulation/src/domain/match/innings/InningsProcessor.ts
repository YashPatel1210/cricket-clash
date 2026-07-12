import { Delivery } from "../delivery";
import { Score } from "../score";

import { Innings } from "./Innings";

export class InningsProcessor {
  public process(innings: Innings, delivery: Delivery): Innings {
    let score: Score = innings
      .getScore()
      .afterRuns(delivery.runs())
      .afterBall();

    if (delivery.isWicket()) {
      score = score.afterWicket();
    }

    const battingPair = innings.getBattingPair().afterRuns(delivery.runs());

    const bowlingSpell = innings.getBowlingSpell().afterBall();

    return new Innings(
      innings.getBattingTeam(),
      innings.getBowlingTeam(),
      score,
      battingPair,
      bowlingSpell,
    );
  }
}
