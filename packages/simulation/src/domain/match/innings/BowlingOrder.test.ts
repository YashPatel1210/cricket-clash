import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";

import { BowlingOrder } from "./BowlingOrder";

describe("BowlingOrder", () => {
  it("should expose the current bowler", () => {
    const bowler1 = PlayerBuilder.bowler().build();
    const bowler2 = PlayerBuilder.bowler().build();

    const order = new BowlingOrder([bowler1, bowler2]);

    expect(order.current()).toBe(bowler1);
  });

  it("should move to the next bowler", () => {
    const bowler1 = PlayerBuilder.bowler().build();
    const bowler2 = PlayerBuilder.bowler().build();

    const order = new BowlingOrder([bowler1, bowler2]);

    const next = order.next();

    expect(next.current()).toBe(bowler2);
  });

  it("should preserve the bowling order", () => {
    const bowler1 = PlayerBuilder.bowler().build();
    const bowler2 = PlayerBuilder.bowler().build();
    const bowler3 = PlayerBuilder.bowler().build();

    const order = new BowlingOrder([bowler1, bowler2, bowler3]);

    expect(order.current()).toBe(bowler1);

    expect(order.next().current()).toBe(bowler2);

    expect(order.next().next().current()).toBe(bowler3);
  });

  it("should require at least one bowler", () => {
    expect(() => new BowlingOrder([])).toThrow(
      "Bowling order must contain at least one bowler.",
    );
  });
});
