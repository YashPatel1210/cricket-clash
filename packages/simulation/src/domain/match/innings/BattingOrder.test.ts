import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";

import { BattingOrder } from "./BattingOrder";

describe("BattingOrder", () => {
  it("should create a batting order", () => {
    const order = new BattingOrder([
      PlayerBuilder.batter().build(),
      PlayerBuilder.batter().build(),
    ]);

    expect(order).toBeDefined();
  });

  it("should return the next batter", () => {
    const first = PlayerBuilder.batter().build();
    const second = PlayerBuilder.batter().build();

    const order = new BattingOrder([first, second]);

    expect(order.next()).toBe(first);
  });

  it("should return a new batting order after consuming a batter", () => {
    const first = PlayerBuilder.batter().build();
    const second = PlayerBuilder.batter().build();

    const order = new BattingOrder([first, second]);

    const updated = order.afterNext();

    expect(updated.next()).toBe(second);

    expect(order.next()).toBe(first);
  });

  it("should expose remaining batters", () => {
    const players = [
      PlayerBuilder.batter().build(),
      PlayerBuilder.batter().build(),
      PlayerBuilder.batter().build(),
    ];

    const order = new BattingOrder(players);

    expect(order.remaining()).toHaveLength(3);
  });

  it("should identify an empty batting order", () => {
    const order = new BattingOrder([]);

    expect(order.isCompleted()).toBe(true);
  });

  it("should reject next batter when batting order is empty", () => {
    const order = new BattingOrder([]);

    expect(() => order.next()).toThrow("No batters remaining.");
  });
});
