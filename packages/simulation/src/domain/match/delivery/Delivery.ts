import { BattingPair } from "../innings";
import { BowlingSpell } from "../innings/BowlingSpell";

import { DeliveryOutcome } from "./DeliveryOutcome";

export class Delivery {
  public constructor(
    private readonly bowlingSpell: BowlingSpell,
    private readonly battingPair: BattingPair,
    private readonly outcome: DeliveryOutcome,
  ) {}

  public getBowlingSpell(): BowlingSpell {
    return this.bowlingSpell;
  }

  public getBattingPair(): BattingPair {
    return this.battingPair;
  }

  public getOutcome(): DeliveryOutcome {
    return this.outcome;
  }

  public runs(): number {
    switch (this.outcome) {
      case DeliveryOutcome.DOT:
        return 0;

      case DeliveryOutcome.ONE:
        return 1;

      case DeliveryOutcome.TWO:
        return 2;

      case DeliveryOutcome.THREE:
        return 3;

      case DeliveryOutcome.FOUR:
        return 4;

      case DeliveryOutcome.SIX:
        return 6;

      case DeliveryOutcome.WICKET:
        return 0;
    }
  }

  public isBoundary(): boolean {
    return (
      this.outcome === DeliveryOutcome.FOUR ||
      this.outcome === DeliveryOutcome.SIX
    );
  }

  public isWicket(): boolean {
    return this.outcome === DeliveryOutcome.WICKET;
  }

  public isDotBall(): boolean {
    return this.outcome === DeliveryOutcome.DOT;
  }
}
