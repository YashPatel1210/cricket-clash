import { Player } from "../../player";
import { Delivery } from "../delivery/Delivery";

import { BowlerLedger } from "./BowlerLedger";
import { BowlingOrder } from "./BowlingOrder";
import { BowlingSpell } from "./BowlingSpell";

/**
 * BowlingAttack orchestrates the bowling rotation across an innings.
 *
 * It maintains the current BowlingSpell, the rotation order, and a
 * BowlerLedger to enforce per-bowler over quotas.
 */
export class BowlingAttack {
  private constructor(
    private readonly currentSpell: BowlingSpell,
    private readonly currentOrder: BowlingOrder,
    private readonly ledger: BowlerLedger,
    private readonly maxBallsPerBowler: number,
  ) {}

  public static create(
    order: BowlingOrder,
    maxBallsPerBowler: number = 24,
  ): BowlingAttack {
    return new BowlingAttack(
      new BowlingSpell(order.current(), 0),
      order,
      BowlerLedger.empty(),
      maxBallsPerBowler,
    );
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

  public getLedger(): BowlerLedger {
    return this.ledger;
  }

  public afterDelivery(delivery: Delivery): BowlingAttack {
    return new BowlingAttack(
      this.currentSpell.afterDelivery(delivery),
      this.currentOrder,
      this.ledger,
      this.maxBallsPerBowler,
    );
  }

  public afterOver(): BowlingAttack {
    const currentBowler = this.currentSpell.getBowler();

    // A completed over = exactly 6 legal deliveries.
    // Use 6 for quota tracking regardless of wides/no-balls bowled.
    const updatedLedger = this.ledger.withBalls(currentBowler, 6);

    // Find the next eligible bowler (skip exhausted bowlers)
    const nextOrder = this.findNextEligibleOrder(
      this.currentOrder.next(),
      updatedLedger,
    );

    return new BowlingAttack(
      new BowlingSpell(nextOrder.current(), 0),
      nextOrder,
      updatedLedger,
      this.maxBallsPerBowler,
    );
  }

  private findNextEligibleOrder(
    startOrder: BowlingOrder,
    ledger: BowlerLedger,
  ): BowlingOrder {
    const totalBowlers = startOrder.getBowlers().length;
    let order = startOrder;

    for (let i = 0; i < totalBowlers; i++) {
      if (!ledger.hasReachedQuota(order.current(), this.maxBallsPerBowler)) {
        return order;
      }
      order = order.next();
    }

    // Fallback: all bowlers exhausted (should not happen in a valid match)
    return startOrder;
  }
}
