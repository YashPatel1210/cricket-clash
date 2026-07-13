import { Player } from "../../player";

import { BowlingOrder } from "./BowlingOrder";
import { BowlingSpell } from "./BowlingSpell";

export class BowlingAttack {
  private constructor(
    private readonly currentSpell: BowlingSpell,
    private readonly currentOrder: BowlingOrder,
  ) {}

  public static create(order: BowlingOrder): BowlingAttack {
    return new BowlingAttack(new BowlingSpell(order.current(), 0), order);
  }

  public getCurrentSpell(): BowlingSpell {
    return this.currentSpell;
  }

  public getCurrentBowler(): Player {
    return this.currentSpell.getBowler();
  }

  public getCurrentOrder(): BowlingOrder {
    return this.currentOrder;
  }

  public afterBall(): BowlingAttack {
    return new BowlingAttack(this.currentSpell.afterBall(), this.currentOrder);
  }

  public afterOver(): BowlingAttack {
    return BowlingAttack.create(this.currentOrder.next());
  }
}
