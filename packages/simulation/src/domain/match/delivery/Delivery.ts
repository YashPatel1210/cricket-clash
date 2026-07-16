import { BattingPair } from "../innings";
import { BowlingSpell } from "../innings";

import { DeliveryEvent } from "./DeliveryEvent";
import { DeliveryOutcome } from "./DeliveryOutcome";

export class Delivery {
  public constructor(
    private readonly bowlingSpell: BowlingSpell,
    private readonly battingPair: BattingPair,
    private readonly event: DeliveryEvent,
  ) {}

  public getBowlingSpell(): BowlingSpell {
    return this.bowlingSpell;
  }

  public getBattingPair(): BattingPair {
    return this.battingPair;
  }

  public getEvent(): DeliveryEvent {
    return this.event;
  }

  public runs(): number {
    return this.event.getRuns();
  }

  public isBoundary(): boolean {
    return this.event.isBoundary();
  }

  public isWicket(): boolean {
    return this.event.isWicket();
  }

  public isDotBall(): boolean {
    return this.event.getOutcome() === DeliveryOutcome.DOT;
  }
}
