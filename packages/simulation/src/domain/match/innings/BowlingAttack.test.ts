import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";

import { BowlingAttack } from "./BowlingAttack";
import { BowlingOrder } from "./BowlingOrder";

describe("BowlingAttack", () => {
  it("should create an opening spell", () => {
    const bowler = PlayerBuilder.bowler().build();

    const attack = BowlingAttack.create(new BowlingOrder([bowler]));

    expect(attack.getCurrentBowler()).toBe(bowler);

    expect(attack.getCurrentSpell().getBallsBowled()).toBe(0);
  });

  it("should expose the bowling order", () => {
    const bowler = PlayerBuilder.bowler().build();

    const order = new BowlingOrder([bowler]);

    const attack = BowlingAttack.create(order);

    expect(attack.getCurrentOrder()).toBe(order);
  });

  it("should record a ball", () => {
    const bowler = PlayerBuilder.bowler().build();

    const attack = BowlingAttack.create(new BowlingOrder([bowler]));

    const updated = attack.afterBall();

    expect(updated.getCurrentSpell().getBallsBowled()).toBe(1);
  });

  it("should change bowler after an over", () => {
    const bowler1 = PlayerBuilder.bowler().named("Bumrah").build();

    const bowler2 = PlayerBuilder.bowler().named("Siraj").build();

    const attack = BowlingAttack.create(new BowlingOrder([bowler1, bowler2]));

    const next = attack.afterOver();

    expect(next.getCurrentBowler()).toBe(bowler2);

    expect(next.getCurrentSpell().getBallsBowled()).toBe(0);
  });
});
